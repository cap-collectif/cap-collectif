module.exports = {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Warn when an enabled Cypress feature toggle is not disabled in the same file.',
    },
    schema: [],
  },
  create(context) {
    const enabledFeatures = new Map()
    const disabledFeatures = new Set()

    const getFeatureTask = node => {
      if (
        node.callee.type !== 'MemberExpression' ||
        node.callee.object.type !== 'Identifier' ||
        node.callee.object.name !== 'cy' ||
        node.callee.property.type !== 'Identifier' ||
        node.callee.property.name !== 'task' ||
        node.arguments[0]?.type !== 'Literal' ||
        node.arguments[1]?.type !== 'Literal'
      ) {
        return null
      }

      const taskName = node.arguments[0].value
      if (taskName !== 'enable:feature' && taskName !== 'disable:feature') return null

      return { feature: node.arguments[1].value, taskName }
    }

    return {
      CallExpression(node) {
        const featureTask = getFeatureTask(node)
        if (!featureTask || typeof featureTask.feature !== 'string') return

        if (featureTask.taskName === 'enable:feature') {
          enabledFeatures.set(featureTask.feature, node)
        } else {
          disabledFeatures.add(featureTask.feature)
        }
      },
      'Program:exit'() {
        enabledFeatures.forEach((node, feature) => {
          if (!disabledFeatures.has(feature)) {
            context.report({
              node,
              message: `Feature toggle "${feature}" is enabled but not disabled in this file.`,
            })
          }
        })
      },
    }
  },
}
