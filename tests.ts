import test from 'ava';
import {parse, print, visit} from 'recast';
import transformers from './transformers';

const codeAssertion = (name: string, original: string, final: string) => {
  const ast = parse(original);
  visit(ast, transformers);
  const transformed = print(ast).code;
  test(name, (t) => t.is(transformed, final));
};

codeAssertion('getIn', 'obj.getIn(p)', 'path(p, obj)');
codeAssertion('getIn Path', 'obj.getIn([a, b, c])', 'path([a, b, c], obj)');
codeAssertion('getIn with default', 'obj.getIn([a, b, c], def)', 'pathOr(def, [a, b, c], obj)');

codeAssertion('get', 'obj.get(p)', 'prop(p, obj)');
codeAssertion('get with default', 'obj.get(p, def)', 'propOr(def, p, obj)');

codeAssertion('simple setIn ', 'list.setIn([3, 0], 999)', 'assocPath([3, 0], 999, list)');
codeAssertion(
  'setIn',
  'fromJS({foo: 42}).setIn(arr, 999)',
  'assocPath(arr, 999, fromJS({foo: 42}))',
);

codeAssertion('simple set', 'originalList.set(key, 2)', 'assoc(key, 2, originalList)');
