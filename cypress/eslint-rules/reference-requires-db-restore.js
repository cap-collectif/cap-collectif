module.exports = {
  meta: {
    type: 'problem',
    docs: {
      description: 'Require database restoration in reference Cypress tests.',
    },
    schema: [],
  },
  create(context) {
    const sourceCode = context.getSourceCode()
    let isReference = false
    let hasDatabaseRestore = false

    return {
      Program() {
        isReference = sourceCode.getAllComments().some(comment => /@cypress-status\s+reference\b/.test(comment.value))
      },
      CallExpression(node) {
        if (
          node.callee.type === 'MemberExpression' &&
          node.callee.object.type === 'Identifier' &&
          node.callee.object.name === 'cy' &&
          node.callee.property.type === 'Identifier' &&
          node.callee.property.name === 'task' &&
          node.arguments[0]?.type === 'Literal' &&
          node.arguments[0].value === 'db:restore'
        ) {
          hasDatabaseRestore = true
        }
      },
      'Program:exit'(node) {
        if (isReference && !hasDatabaseRestore) {
          context.report({ node, message: "Reference Cypress tests must call cy.task('db:restore')." })
        }
      },
    }
  },
}
