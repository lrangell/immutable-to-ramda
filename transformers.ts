import {types} from 'recast';
import {NodePath} from 'ast-types/lib/node-path';

const b = types.builders;
const {identifier, stringLiteral, callExpression} = types.builders;

type FunctionCall = NodePath<types.namedTypes.CallExpression>;

const transformers: types.Visitor = {
  visitCallExpression: function (path) {
    //@ts-ignore
    console.log({name: path.name, n: path.node});
    console.dir(path, {depth: null});
    getIn(path);
    this.traverse(path);
  },
  visitObjectMethod: function (path) {
    //@ts-ignore
    getIn(path);
    this.traverse(path);
  },
};

const getter = (newFn: string) => (path: FunctionCall) => {
  const args = path.node.arguments;
  const hasDefaultValue = args.length === 2;
  //@ts-ignore
  const [ramdaFunction, newArgs] = hasDefaultValue
    ? //@ts-ignore
      [`${newFn}Or`, [args[1], args[0], path.node.callee.object]]
    : //@ts-ignore
      [newFn, [...args, path.node.callee.object]];
  //@ts-ignore
  const replacement = callExpression(identifier(ramdaFunction), newArgs);
  path.replace(replacement);
};
const getIn = getter('path');
const get = getter('prop');

//TODO: manipulate parent
const keySeq = (path: FunctionCall) => {
  const args = path.node.arguments;
  path.node.callee = identifier('keys');
};

const setIn = (path: FunctionCall) => {
  const args = path.node.arguments;
  path.node.callee = identifier('assocPath');
};
const filterNot = (path: FunctionCall) => {
  const iterable = path.parent;
  const args = path.node.arguments;
  path.node.callee = identifier('keys');
};

export default transformers;
