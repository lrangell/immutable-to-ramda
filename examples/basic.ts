import { fromJS, fromArray } from "immutable";

const plain_object = { a: 42, b: { c: [1, 2, 3] } };
const immutableObject = fromJS(plain_object);
const arr = fromArray([2, 3, 5, 7]);

const [unmodified, code] = [0, 1, 2];

const p = "key";

obj.get(p);
obj.getIn(["a", "b", "c"]);

const foo = immutableObject.get("field");
const bar = immutableObject.get(p);

const awesomeValue = immutableObject.getIn(
  ["field", "another_field", "with default var"],
  0
);
