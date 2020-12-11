var { GraphQLError } = require('graphql/error');

function NoForbiddenPrefix(context) {
  return {
    NamedType(node) {
      // console.log(node.name.value);
      const name = node.name.value;
      if (name.startsWith('Internal') || name.startsWith('Preview') || name.startsWith('Public')) {
        context.reportError(
          new GraphQLError(
            `The name should ${name} not contain "Internal", "Preview" or "Public".`,
            [node],
          ),
        );
      }
    },
  };
}

module.exports.NoForbiddenPrefix = NoForbiddenPrefix;
