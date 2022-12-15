import { types } from 'recast';
import { GetTransformation, ImmutableToRamdaMap } from './types';
declare const transformers: types.Visitor;
export declare const importTransformer: types.Visitor;
export declare const nameAndTransform: (ts: GetTransformation, immutableRamdamap: ImmutableToRamdaMap) => {
    [index: string]: {
        ramdaFn: string;
        transformation: import("./types").Transformation;
    };
};
export default transformers;
