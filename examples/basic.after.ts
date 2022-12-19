import { fromJS, fromArray } from "immutable";

const plain_object = { a: 42, b: { c: [1, 2, 3] } };
const immutableObject = plain_object;
const arr = [2, 3, 5, 7];

const [unmodified, code] = [0, 1, 2];

const p = "key";

prop(p, obj);
obj?.a?.b?.c;

const foo = immutableObject.field;
const bar = prop(p, immutableObject);

const awesomeValue = pathOr(0, ["field", "another_field", "with default var"], immutableObject);
