module.exports = {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Warn about unprotected legacy feature toggles; recognise deterministic suite setup.',
    },
    schema: [],
  },
  create(context) {
    const enabledFeatures = new Map()
    const setupHelperNames = new Set()
    const guardedFunctions = new Set()
    const enabledAncestors = new Map()
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
      ImportDeclaration(node) {
        if (!/\/support\/setupFeatureFlags$/.test(node.source.value)) return
        node.specifiers.forEach(specifier => {
          if (specifier.imported?.name === 'setupFeatureFlags') setupHelperNames.add(specifier.local.name)
        })
      },
      CallExpression(node) {
        if (node.callee.type === 'Identifier' && setupHelperNames.has(node.callee.name)) {
          const suiteFunction = node.parent?.parent?.parent
          if (['ArrowFunctionExpression', 'FunctionExpression'].includes(suiteFunction?.type)) {
            guardedFunctions.add(suiteFunction)
          }
        }
        const featureTask = getFeatureTask(node)
        if (!featureTask || typeof featureTask.feature !== 'string') return

        if (featureTask.taskName === 'enable:feature') {
          enabledFeatures.set(featureTask.feature, node)
          enabledAncestors.set(node, context.getAncestors())
        } else {
          disabledFeatures.add(featureTask.feature)
        }
      },
      'Program:exit'() {
        enabledFeatures.forEach((node, feature) => {
          const hasDeterministicSetup = enabledAncestors.get(node).some(ancestor => guardedFunctions.has(ancestor))
          if (!disabledFeatures.has(feature) && !hasDeterministicSetup) {
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
