import {types} from 'recast'
import {NodePath} from 'ast-types/lib/node-path'
import {namedTypes} from 'ast-types/gen/namedTypes'
import {ExpressionKind} from 'ast-types/gen/kinds'
import {pluck, propEq, isEmpty} from 'ramda'
// TODO: handle empty List(), Map()
// handle space in literal string on get

const {
  identifier,
  stringLiteral,
  callExpression,
  memberExpression,
  objectExpression,
  arrayExpression,
} = types.builders

type FunctionCall = {
  path: NodePath<namedTypes.CallExpression>
  callee: ExpressionKind
  args: (ExpressionKind | namedTypes.SpreadElement)[]
}

const transformers: types.Visitor = {
  visitCallExpression: function (path) {
    const functionCallName: string = path.value.callee.property?.name

    //@ts-ignore
    if (
      Object.keys(transformersMap).includes(functionCallName) &&
      //@ts-ignore
      !['R', 'this'].includes(path.node.callee.object.name) &&
      //@ts-ignore
      path.node.callee.object.type !== 'ThisExpression'
    ) {
      const calleeNode = path.node.callee as namedTypes.MemberExpression
      const transform = transformersMap[functionCallName]

      //@ts-ignore
      // if (calleeNode.object.type === 'ThisExpression') console.log('----')

      //@ts-ignore
      if (['R'].includes(calleeNode.object.name) || calleeNode.object.type === 'ThisExpression') {
        // console.log('rrrrr')
        this.traverse(path)
      }

      transform({
        path,
        callee: calleeNode.object,
        args: path.node.arguments,
      })
    }

    if (['fromJS', 'toJS', 'fromArray', 'List', 'Map'].includes(path.value?.callee?.name)) {
      unwrapCaller({path, callee: path.value?.callee, args: path.node.arguments})
    }
    this.traverse(path)
  },
  visitObjectMethod: function (path) {
    this.traverse(path)
  },
  visitImportExpression: function (path) {
    // console.dir({path}, {depth: 3})
  },
  visitImportDeclaration: function (path) {
    // console.dir({P: path.value.specifiers}, {depth: 3})
    this.traverse(path)
  },
}

const getter =
  (newFn: string, isGetter = true) =>
  ({path, callee, args}: FunctionCall) => {
    const [propName] = args
    if (callee.type === 'ThisExpression') return

    const hasDefaultValue = args.length > 1 && isGetter
    const functionName = identifier(`R.${newFn}${hasDefaultValue ? 'Or' : ''}`)
    const newArgs = hasDefaultValue ? args.reverse() : args

    const expr =
      isGetter && propName.type === 'StringLiteral'
        ? memberExpression(callee, identifier(propName.value))
        : callExpression(functionName, [...newArgs, callee])

    path.replace(expr)
  }

const getIn = ({path, args, callee}: FunctionCall) => {
  const [propsArray, ...defValue] = args
  const allLiteral = (x): x is types.namedTypes.StringLiteral[] =>
    x.every(propEq('type', 'StringLiteral'))

  const expr =
    propsArray.type === 'ArrayExpression' && allLiteral(propsArray.elements)
      ? pluck('value', propsArray.elements)
          .map(identifier)
          .reduce(
            (acc, curr) => memberExpression.from({object: acc, property: curr, optional: true}),
            callee,
          )
      : callExpression(identifier('path'), [...args, callee])
  path.replace(expr)
}
const equalArity =
  (newFn: string) =>
  ({path, args, callee}: FunctionCall) => {
    path.replace(callExpression(identifier(`R.${newFn}`), [...args, callee]))
  }
const callerToArg =
  (newFn: string) =>
  ({path, callee}: FunctionCall) => {
    path.replace(callExpression(identifier(`R.${newFn}`), [callee]))
  }
const callerAsLastArg =
  (newFn: string) =>
  ({path, callee, args}: FunctionCall) => {
    // if (newFn === 'modify') {
    //   console.log({callee})
    // }
    path.replace(callExpression(identifier(`R.${newFn}`), [...args, callee]))
  }
const callerAsFirstArg =
  (newFn: string) =>
  ({path, callee, args}: FunctionCall) => {
    path.replace(callExpression(identifier(`R.${newFn}`), [callee, ...args]))
  }
const unwrapCaller = ({path, callee, args}: FunctionCall) => {
  //@ts-ignore
  const expr = isEmpty(args)
    ? //@ts-ignore
      {Map: objectExpression([]), List: arrayExpression([])}[callee.name]
    : args[0]
  path.replace(expr)
}

const transformersMap = {
  getIn: getIn,
  get: getter('prop'),
  set: getter('assoc', false),
  setIn: getter('assocPath', false),
  keySeq: callerToArg('keys'),
  flatten: callerToArg('flatten'),
  filterNot: callerAsLastArg('reject'),
  zip: callerAsLastArg('zip'),
  updateIn: callerAsLastArg('modifyPath'),
  groupBy: callerAsLastArg('groupBy'),
  // flatMap: callerAsLastArg('chain'),
  toJS: ({path, callee}: FunctionCall) => {
    path.replace(callee)
  },
  Map: equalArity('fromPairs'),
  isEmpty: callerToArg('isEmpty'),
  flip: callerToArg('invertObj'),
  sortBy: ({path, callee, args}: FunctionCall) => {
    path.replace(
      callExpression(identifier(`R.sort`), [callExpression(identifier('R.ascend'), args), callee]),
    )
  },
  update: callerAsLastArg('modify'),
  findLast: callerAsLastArg('findLast'),
  merge: callerAsFirstArg('mergeRight'),
  delete: callerAsLastArg('dissoc'),
  deleteIn: callerAsLastArg('dissocPath'),
  valueSeq: callerAsLastArg('values'),
}

export const rfunctions = [
  'path',
  'prop',
  'assoc',
  'assocPath',
  'flatten',
  'reject',
  'modifyPath',
  'groupBy',
  'chain',
  'fromPairs',
  'isEmpty',
]

export default transformers
