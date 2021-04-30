import test from 'ava';
import {parse, print, run, visit} from 'recast';
import transformers from './transformers';

const codeAssertion = (name: string, original: string, final: string) => {
  const ast = parse(original);
  visit(ast, transformers);
  const transformed = print(ast).code;
  test(name, (t) => t.is(transformed, final));
};

codeAssertion('getIn', 'obj.getIn(p)', 'prop(p, obj)');

codeAssertion('getIn Path', 'obj.getIn([a, b, c])', 'path([a, b, c], obj)');
