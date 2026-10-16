module.exports = {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Disallow fixed Cypress waits.',
    },
    schema: [],
  },
  create(context) {
    return {
      CallExpression(node) {
        if (
          node.callee.type !== 'MemberExpression' ||
          node.callee.object.type !== 'Identifier' ||
          node.callee.object.name !== 'cy' ||
          node.callee.property.type !== 'Identifier' ||
          node.callee.property.name !== 'wait'
        ) {
          return
        }

        const firstArgument = node.arguments[0]
        if (firstArgument?.type === 'Literal' && typeof firstArgument.value === 'number') {
          context.report({
            node: firstArgument,
            message: 'Use a Cypress alias or an application assertion instead of a fixed cy.wait() delay.',
          })
        }
      },
    }
  },
}
