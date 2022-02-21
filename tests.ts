import test from 'ava'
import {parse, print, visit} from 'recast'
import transformers from './src/transformers'

const codeAssertion = (name: string, original: string, final: string) => {
  const ast = parse(original)
  visit(ast, transformers)
  const transformed = print(ast).code
  test(name, (t) => t.is(transformed, final))
}

codeAssertion('getIn', 'obj.getIn(p)', 'path(p, obj)')
codeAssertion('getIn Path', 'obj.getIn([a, b, c])', 'path([a, b, c], obj)')
codeAssertion('getIn with default', 'obj.getIn([a, b, c], def)', 'pathOr(def, [a, b, c], obj)')

codeAssertion('get', 'obj.get(p)', 'prop(p, obj)')
codeAssertion('get with default', 'obj.get(p, def)', 'propOr(def, p, obj)')

codeAssertion('simple setIn ', 'list.setIn([3, 0], 999)', 'assocPath([3, 0], 999, list)')
codeAssertion('setIn', 'fromJS({foo: 42}).setIn(arr, 999)', 'assocPath(arr, 999, {foo: 42})')

codeAssertion('simple set', 'originalList.set(key, 2)', 'assoc(key, 2, originalList)')

codeAssertion('fromJS', 'fromJS(x)', 'x')
codeAssertion('fromArray', 'fromArray(x)', 'x')
codeAssertion('toJS', 'x.toJS()', 'x')
// codeAssertion('fromJS', 'x.toJS()', 'x');
//
codeAssertion('updateIn', 'x.updateIn(path, fn)', 'modifyPath(path, fn, x)')
codeAssertion('flatten', 'x.flatten()', 'flatten(x)')

codeAssertion('filterNot', 'x.filterNot(p)', 'reject(p, x)')
codeAssertion('zip', 'x.zip(p)', 'zip(p, x)')
// codeAssertion('update', 'x.update(f)', 'f(x)')
codeAssertion('groupBy', 'x.groupBy(f)', 'groupBy(f, x)')
// codeAssertion('Map', 'Map(x)', 'fromPairs(x)')
codeAssertion('flatMap', 'x.flatMap(f)', 'chain(f, x)')
// codeAssertion('push', 'x.push(y)', 'append(y, x)')

// TODO: mergeIn,
// isEmpty, FlatMap
