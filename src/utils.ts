import {fromPairs} from 'ramda';
import {NodePath} from 'ast-types/lib/node-path';
import {ExpressionKind} from 'ast-types/gen/kinds';
import {namedTypes} from 'ast-types/gen/namedTypes';

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
  {ramdaFn: RamdaFunctionName; transformation: Transformation}
>;
export const nameAndTransform = (ts: GetTransformation, immutableRamdamap: ImmutableToRamdaMap) =>
  fromPairs(
    Object.entries(immutableRamdamap).map(([immutableFn, ramdaFn]) => [
      immutableFn,
      {ramdaFn, transformation: ts(ramdaFn)},
    ]),
  );
