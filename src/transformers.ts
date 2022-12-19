import { types } from 'recast';
import { NodePath } from 'ast-types/lib/node-path';
import { namedTypes } from 'ast-types/gen/namedTypes';
import { pluck, propEq, isEmpty, difference, fromPairs } from 'ramda';
import {
  FunctionCall,
  GetTransformation,
  ImmutableToRamdaMap,
  TransformationMap,
} from './types';
// TODO: handle empty List(), Map()
// TODO: handle space in literal string on get

const {
  identifier,
  stringLiteral,
  callExpression,
  memberExpression,
  objectExpression,
  arrayExpression,
  importDeclaration,
  importSpecifier,
} = types.builders;

const functionsToImport: Set<string> = new Set();

const transformers: types.Visitor = {
  visitCallExpression: function (path) {
    const functionCallName: string = path.value.callee.property?.name;
    const calleeNode = path.node.callee as namedTypes.MemberExpression;

    const avoidThisExpr =
      //@ts-ignore
      !['R', 'this'].includes(calleeNode?.object?.name) &&
      calleeNode?.object?.type !== 'ThisExpression';
    const isSupported = Object.keys(transformersMap).includes(functionCallName);

    if (isSupported && avoidThisExpr) {
      const { ramdaFn, transformation } = transformersMap[functionCallName];

      transformation({
        path,
        callee: calleeNode.object,
        args: path.node.arguments,
      });
      functionsToImport.add(ramdaFn);
    }

    if (
      ['fromJS', 'toJS', 'fromArray', 'List', 'Map'].includes(
        path.value?.callee?.name
      )
    ) {
      unwrapCaller({
        path,
        callee: path.value?.callee,
        args: path.node.arguments,
      });
    }
    this.traverse(path);
  },
};

export const importTransformer: types.Visitor = {
  visitImportDeclaration: function (path) {
    addImport(path);
    this.traverse(path);
  },
};

const getterSetter =
  (newFn: string, isGetter = true) =>
  ({ path, callee, args }: FunctionCall) => {
    const [propName] = args;
    if (callee.type === 'ThisExpression') return;

    const hasDefaultValue = args.length > 1 && isGetter;
    const functionName = identifier(`${newFn}${hasDefaultValue ? 'Or' : ''}`);
    const newArgs = hasDefaultValue ? args.reverse() : args;

    const expr =
      isGetter && propName.type === 'StringLiteral'
        ? memberExpression(callee, identifier(propName.value))
        : callExpression(functionName, [...newArgs, callee]);

    path.replace(expr);
  };

const getIn = ({ path, args, callee }: FunctionCall) => {
  const [propsArray, ...defValue] = args;
  const allLiteral = (x: any[]): x is types.namedTypes.StringLiteral[] =>
    x.every(propEq('type', 'StringLiteral'));

  if (!isEmpty(defValue)) {
    const expr = callExpression(identifier('pathOr'), [
      defValue[0],
      propsArray,
      callee,
    ]);
    path.replace(expr);
    return;
  }

  //@ts-ignore
  const { elements } = propsArray;

  const expr =
    propsArray.type === 'ArrayExpression' && allLiteral(elements)
      ? pluck('value', elements)
          .map(identifier)
          .reduce(
            (acc, curr) =>
              memberExpression.from({
                object: acc,
                property: curr,
                optional: true,
              }),
            callee
          )
      : callExpression(identifier('path'), [propsArray, callee]);
  path.replace(expr);
};

const callerToArg =
  (newFn: string) =>
  ({ path, callee }: FunctionCall) => {
    path.replace(callExpression(identifier(newFn), [callee]));
  };
const callerAsLastArg =
  (newFn: string) =>
  ({ path, callee, args }: FunctionCall) => {
    path.replace(callExpression(identifier(newFn), [...args, callee]));
  };
const callerAsFirstArg =
  (newFn: string) =>
  ({ path, callee, args }: FunctionCall) => {
    path.replace(callExpression(identifier(newFn), [callee, ...args]));
  };
const unwrapCaller = ({ path, callee, args }: FunctionCall) => {
  const expr = isEmpty(args)
    ? //@ts-ignore
      { Map: objectExpression([]), List: arrayExpression([]) }[callee.name]
    : args[0];
  path.replace(expr);
};

export const nameAndTransform = (
  ts: GetTransformation,
  immutableRamdamap: ImmutableToRamdaMap
) =>
  fromPairs(
    Object.entries(immutableRamdamap).map(([immutableFn, ramdaFn]) => [
      immutableFn,
      { ramdaFn, transformation: ts(ramdaFn) },
    ])
  );

const transformersMap: TransformationMap = {
  ...nameAndTransform(callerAsLastArg, {
    Map: 'fromPairs',
    filterNot: 'reject',
    zip: 'zip',
    updateIn: 'modifyPath',
    groupBy: 'groupBy',
    update: 'modify',
    findLast: 'findLast',
    delete: 'dissoc',
    deleteIn: 'dissocPath',
    valueSeq: 'values',
  }),
  ...nameAndTransform(callerToArg, {
    keySeq: 'keys',
    flatten: 'flatten',
    isEmpty: 'isEmpty',
    flip: 'invertObj',
  }),
  ...nameAndTransform(callerAsFirstArg, { merge: 'mergeRight' }),
  getIn: { ramdaFn: 'pathOr', transformation: getIn },
  get: { ramdaFn: 'prop', transformation: getterSetter('prop') },
  set: { ramdaFn: 'assoc', transformation: getterSetter('assoc', false) },
  setIn: {
    ramdaFn: 'assocPath',
    transformation: getterSetter('assocPath', false),
  },
  sortBy: {
    ramdaFn: 'sort',
    transformation: ({ path, callee, args }: FunctionCall) => {
      path.replace(
        callExpression(identifier(`sort`), [
          callExpression(identifier('ascend'), args),
          callee,
        ])
      );
      functionsToImport.add('ascend');
    },
  },
  toJS: {
    ramdaFn: '',
    transformation: ({ path, callee }: FunctionCall) => {
      path.replace(callee);
    },
  },
};

function addImport(path: NodePath<types.namedTypes.ImportDeclaration, any>) {
  if (path.value.source.value !== 'ramda') return;
  const imports = path.value.specifiers ?? [];
  const importsIdentifiers = imports.map((s: any) => s?.imported?.name);
  const newImportsIdentifiers = difference(
    Array.from(functionsToImport),
    importsIdentifiers
  );

  const newImports = newImportsIdentifiers
    .filter(Boolean)
    .map((f) => importSpecifier(identifier(f)));

  const importExpr = importDeclaration(
    [...imports, ...newImports],
    stringLiteral('ramda')
  );
  path.replace(importExpr);
}

export default transformers;
