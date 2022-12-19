import { parse, print, visit } from 'recast';
import transformers, { importTransformer } from './transformers';
import { promises } from 'fs';
import { diffLines } from 'diff';
//@ts-ignore
import { parseSync } from '@babel/core';
import chalk from 'chalk';
import signale from 'signale';

const parseFile = async (path: string) =>
  promises
    .readFile(path, 'utf-8')
    .then((src) => ({
      src,
      ast: parse(src, {
        parser: {
          parse: (source: string) =>
            parseSync(source, {
              plugins: [
                [require(`@babel/plugin-syntax-typescript`), { isTSX: true }],
              ],
              overrides: [
                {
                  test: [`**/*.ts`, `**/*.tsx`],
                  plugins: [
                    [
                      require(`@babel/plugin-syntax-typescript`),
                      { isTSX: true },
                    ],
                  ],
                },
              ],
              filename: path,
              parserOpts: {
                tokens: true,
              },
            }),
        },
      }),
    }))
    .catch((err: any) => {
      signale.error(`unable to parse ${path}`);
      signale.error(err);
    });

const transformSource = async (path: string) => {
  const code = await parseFile(path);
  if (!code) return;
  const { src, ast } = code;
  visit(ast, transformers);
  visit(ast, importTransformer);
  const newSrc = print(ast).code;
  return src === newSrc ? false : { src, newSrc };
};

export const printDiff = async (path: string) => {
  const code = await transformSource(path);
  if (!code) return;
  diffLines(code.src, code.newSrc).forEach((part) => {
    const color = part.added ? 'green' : part.removed ? 'red' : null;
    if (color) console.log(chalk[color](part.value));
  });
};

export const rewriteSource = async (path: string) => {
  const code = await transformSource(path);
  if (!code) return;
  const newFh = await promises.open(path, 'w');
  newFh.writeFile(code.newSrc);
  signale.success(`${path} written`);
};
