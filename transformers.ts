import {types} from 'recast';
import {NodePath} from 'ast-types/lib/node-path';

const b = types.builders;
const {identifier, stringLiteral, callExpression} = types.builders;

type FunctionCall = NodePath<types.namedTypes.CallExpression>;

const transformers: types.Visitor = {
  visitCallExpression: function (path) {
    const functionCallName: string = path.value.callee.property?.name;
    const transformation = transformersMap[functionCallName];
    if (transformation) transformation(path);
    this.traverse(path);
  },
  visitObjectMethod: function (path) {
    this.traverse(path);
  },
};

const getter =
  (newFn: string, isGetter = true) =>
  (path: FunctionCall) => {
    const args = path.node.arguments;
    const [key, val] = [args[0], args[1] || false];
    //@ts-ignore
    const obj = path.node.callee.object;

    const hasDefaultValue = val && isGetter; //@ts-ignore
    const functionName = identifier(newFn + (hasDefaultValue ? 'Or' : ''));
    const newArgs = hasDefaultValue ? [val, key] : args;

    //@ts-ignore
    path.replace(callExpression(functionName, [...newArgs, obj]));
  };

const transformersMap = {
  getIn: getter('path'),
  get: getter('prop'),
  set: getter('assoc', false),
  setIn: getter('assocPath', false),
};

//TODO: manipulate parent
const keySeq = (path: FunctionCall) => {
  const args = path.node.arguments;
  path.node.callee = identifier('keys');
};

const filterNot = (path: FunctionCall) => {
  const iterable = path.parent;
  const args = path.node.arguments;
  path.node.callee = identifier('keys');
};

export default transformers;
