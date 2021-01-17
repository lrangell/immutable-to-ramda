import { types } from "recast";
import { NodePath } from "ast-types/lib/node-path";

const b = types.builders;
const { identifier, stringLiteral } = types.builders;

type FunctionCall = NodePath<types.namedTypes.CallExpression>;

const transformers: types.Visitor = {
  visitCallExpression: function(path) {
    if (path.replace.name === "getIn") {
      getIn(path);
    }
    this.traverse(path)
  }
};

const getIn = (path: FunctionCall) => {
  const args = path.node.arguments
  const replacement = args.length === 2 ? 'pathOr' : 'path'
  path.node.callee = identifier(replacement);
};


export default transformers
