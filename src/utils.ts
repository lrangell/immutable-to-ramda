import { fromPairs } from 'ramda';
import { NodePath } from 'ast-types/lib/node-path';
import { ExpressionKind } from 'ast-types/gen/kinds';
import { namedTypes } from 'ast-types/gen/namedTypes';
import { parse, print, visit } from 'recast';
import transformers, { importTransformer } from './transformers';
import { promises } from 'fs';
import { diffLines } from 'diff';
import { parseSync } from '@babel/core';
import chalk from 'chalk';
import signale from 'signale';

export type FunctionCall = {
  path: NodePath<namedTypes.CallExpression>;
  callee: ExpressionKind;
  args: (ExpressionKind | namedTypes.SpreadElement)[];
};
export type RamdaFunctionName = string;
export type ImmutableFunctionName = string;
export type Transformation = (arg: FunctionCall) => void;
type GetTransformation = (arg: string) => Transformation;
type ImmutableToRamdaMap = Record<ImmutableFunctionName, RamdaFunctionName>;
export type TransformationMap = Record<
  ImmutableFunctionName,
  { ramdaFn: RamdaFunctionName; transformation: Transformation }
>;
export const nameAndTransform = (
  ts: GetTransformation,
  immutableRamdamap: ImmutableToRamdaMap
) =>
  fromPairs(
    Object.entries(immutableRamdamap).map(([immutableFn, ramdaFn]) => [
      immutableFn,
      { ramdaFn, transformation: ts(ramdaFn) },
    ])
  );

const parseFile = async (path: string) =>
  promises
    .readFile(path, 'utf-8')
    .then((src) => ({
      src,
      ast: parse(src, {
        parser: {
          parse: (source: string) =>
            parseSync(source, {
              plugins: [[`@babel/plugin-syntax-typescript`, { isTSX: true }]],
              overrides: [
                {
                  test: [`**/*.ts`, `**/*.tsx`],
                  plugins: [
                    [`@babel/plugin-syntax-typescript`, { isTSX: true }],
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
