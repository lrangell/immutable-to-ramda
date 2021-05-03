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
