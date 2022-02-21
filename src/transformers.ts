import {types} from 'recast'
import {NodePath} from 'ast-types/lib/node-path'

const b = types.builders
const {identifier, stringLiteral, callExpression, memberExpression} = types.builders

type FunctionCall = NodePath<types.namedTypes.CallExpression>

const transformers: types.Visitor = {
  visitCallExpression: function (path) {
    const functionCallName: string = path.value.callee.property?.name
    if (Object.keys(transformersMap).includes(functionCallName)) {
      transformersMap[functionCallName](path)
    }

    if (['fromJS', 'toJS', 'fromArray'].includes(path.value?.callee?.name)) {
      unwrapCaller(path)
    }
    this.traverse(path)
  },
  visitObjectMethod: function (path) {
    this.traverse(path)
  },
}

const getter =
  (newFn: string, isGetter = true) =>
  (path: FunctionCall) => {
    const args = path.node.arguments
    const [propName] = args
    //@ts-ignore
    const obj = path.node.callee.object
    //TODO: use dot notation if arg for get(p)

    const hasDefaultValue = args.length > 1 && isGetter //@ts-ignore
    const functionName = identifier(newFn + (hasDefaultValue ? 'Or' : ''))
    const newArgs = hasDefaultValue ? args.reverse() : args

    const expr =
      propName.type === 'StringLiteral'
        ? memberExpression(obj, identifier(propName.value))
        : callExpression(functionName, [...newArgs, obj])

    path.replace(expr)
  }
const equalArity = (newFn: string) => (path: FunctionCall) => {
  const args = path.node.arguments
  //@ts-ignore
  const obj = path.node.callee.object
  path.replace(callExpression(identifier(newFn), [...args, obj]))
}
const callerToArg = (newFn: string) => (path: FunctionCall) => {
  //@ts-ignore
  const obj = path.node.callee.object
  path.replace(callExpression(identifier(newFn), [obj]))
}
const callerAsLastArg = (newFn: string) => (path: FunctionCall) => {
  //@ts-ignore
  const obj = path.node.callee.object
  const args = path.node.arguments
  //@ts-ignore
  path.replace(callExpression(identifier(newFn), [...args, obj]))
}
const unwrapCaller = (path: FunctionCall) => {
  //@ts-ignore
  path.replace(path.node.arguments[0])
}

const transformersMap = {
  getIn: getter('path'),
  get: getter('prop'),
  set: getter('assoc', false),
  setIn: getter('assocPath', false),
  keySeq: callerToArg('Object.keys'),
  flatten: callerToArg('flatten'),
  filterNot: callerAsLastArg('reject'),
  zip: callerAsLastArg('zip'),
  // push: callerAsLastArg('append'),
  updateIn: callerAsLastArg('modifyPath'),
  groupBy: callerAsLastArg('groupBy'),
  flatMap: callerAsLastArg('chain'),
  // fromJS: unwrapCaller,
  toJS: (path: FunctionCall) => {
    //@ts-ignore
    path.replace(path.node.callee.object)
  },
  // fromArray: unwrapCaller,
  Map: equalArity('fromPairs'),
}

//TODO: manipulate parent
const keySeq = (path: FunctionCall) => {
  const args = path.node.arguments
  path.node.callee = identifier('keys')
}

const filterNot = (path: FunctionCall) => {
  const iterable = path.parent
  const args = path.node.arguments
  path.node.callee = identifier('keys')
}

export default transformers
