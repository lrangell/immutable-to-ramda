export type FunctionCall = {
  path: NodePath<namedTypes.CallExpression>;
  callee: ExpressionKind;
  args: (ExpressionKind | namedTypes.SpreadElement)[];
};
export type RamdaFunctionName = string;
export type ImmutableFunctionName = string;
export type Transformation = (arg: FunctionCall) => void;
export type GetTransformation = (arg: string) => Transformation;
export type ImmutableToRamdaMap = Record<
  ImmutableFunctionName,
  RamdaFunctionName
>;
export type TransformationMap = Record<
  ImmutableFunctionName,
  { ramdaFn: RamdaFunctionName; transformation: Transformation }
>;
