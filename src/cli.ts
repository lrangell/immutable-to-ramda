import {program} from 'commander';
import {parse, print, visit} from 'recast';
import transformers, {importTransformer} from './transformers';
import {promises} from 'fs';
import {diffLines} from 'diff';
import {parseSync} from '@babel/core';

const parseFile = async (path: string) =>
  promises
    .readFile(path, 'utf-8')
    .then((src) => ({
      src,
      ast: parse(src, {
        parser: {
          parse: (source) =>
            parseSync(source, {
              plugins: [[`@babel/plugin-syntax-typescript`, {isTSX: true}]],
              overrides: [
                {
                  test: [`**/*.ts`, `**/*.tsx`],
                  plugins: [[`@babel/plugin-syntax-typescript`, {isTSX: true}]]
                }
              ],
              filename: path,
              parserOpts: {
                tokens: true
              }
            })
        }
      })
    }))
    .catch((err) => {
      console.log(`unable to parse ${path}`['red']);
      console.log(err);
    });

const transformSource = async (path: string) => {
  const code = await parseFile(path);
  if (!code) return;
  const {src, ast} = code;
  visit(ast, transformers);
  visit(ast, importTransformer);
  const newSrc = print(ast).code;
  return src === newSrc ? false : {src, newSrc};
};

const printDiff = async (path: string) => {
  const code = await transformSource(path);
  if (!code) return;
  diffLines(code.src, code.newSrc).forEach((part) => {
    const color = part.added ? 'green' : part.removed ? 'red' : null;
    if (color) console.log(part.value[color]);
  });
};

const rewriteSource = async (path: string) => {
  const code = await transformSource(path);
  if (!code) return;
  const newFh = await promises.open(path, 'w');
  newFh.writeFile(code.newSrc);
  console.log(`${path} written`);
};

program.option('--dry');
const args = program.parse(process.argv);

args.args.forEach(program.opts().dry ? printDiff : rewriteSource);
