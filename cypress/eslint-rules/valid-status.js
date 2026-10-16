const allowedStatuses = new Set(['reference', 'compliant', 'non-compliant', 'legacy', 'obsolete'])

module.exports = {
  meta: {
    type: 'problem',
    docs: {
      description: 'Validate Cypress test status comments.',
    },
    schema: [],
  },
  create(context) {
    const sourceCode = context.getSourceCode()

    return {
      'Program:exit'() {
        sourceCode.getAllComments().forEach(comment => {
          const match = comment.value.match(/@cypress-status\s+([^\s*]+)/)
          if (match && !allowedStatuses.has(match[1])) {
            context.report({
              loc: comment.loc,
              message: `Unknown Cypress status "${match[1]}".`,
            })
          }
        })
      },
    }
  },
}
