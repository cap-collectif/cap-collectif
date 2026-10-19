const suiteNames = new Set(['describe', 'context'])
const hookNames = new Set(['before', 'beforeEach', 'after', 'afterEach'])
const callName = node => (node.type === 'Identifier' ? node.name : null)

const isFlagMutation = node => {
  if (node.callee.type !== 'MemberExpression' || node.callee.object.name !== 'cy') return false
  const method = node.callee.property.name
  return (
    method === 'setFeatureFlags' ||
    method === 'enableFeatureFlag' ||
    method === 'disableFeatureFlag' ||
    (method === 'task' &&
      ['enable:feature', 'disable:feature', 'reset:feature-flags', 'set:feature-flags'].includes(
        node.arguments[0]?.value,
      ))
  )
}

module.exports = {
  meta: {
    type: 'problem',
    docs: { description: 'Require declarative hook configuration in suites using setupFeatureFlags.' },
    schema: [],
  },
  create(context) {
    const helperNames = new Set()
    const guardedSuites = new Set()
    const mutations = []

    return {
      ImportDeclaration(node) {
        if (!/\/support\/setupFeatureFlags$/.test(node.source.value)) return
        node.specifiers.forEach(specifier => {
          if (specifier.imported?.name === 'setupFeatureFlags') helperNames.add(specifier.local.name)
        })
      },
      CallExpression(node) {
        const ancestors = context.getAncestors()
        if (isFlagMutation(node)) mutations.push({ node, ancestors })
        if (!helperNames.has(callName(node.callee))) return

        const body = node.parent?.parent
        const suiteFunction = body?.parent
        const suiteCall = suiteFunction?.parent
        if (
          node.parent?.type !== 'ExpressionStatement' ||
          body?.type !== 'BlockStatement' ||
          suiteCall?.type !== 'CallExpression' ||
          !suiteNames.has(callName(suiteCall.callee))
        ) {
          context.report({
            node,
            message: 'Call setupFeatureFlags directly in the describe/context body, before other hooks.',
          })
          return
        }
        if (guardedSuites.has(suiteFunction)) {
          context.report({ node, message: 'Declare setupFeatureFlags only once per suite.' })
        }
        const precedingStatements = body.body.slice(0, body.body.indexOf(node.parent))
        if (
          precedingStatements.some(
            statement =>
              statement.type === 'ExpressionStatement' &&
              statement.expression.type === 'CallExpression' &&
              (hookNames.has(callName(statement.expression.callee)) ||
                suiteNames.has(callName(statement.expression.callee))),
          )
        ) {
          context.report({ node, message: 'Register setupFeatureFlags before other hooks or nested suites.' })
        }
        guardedSuites.add(suiteFunction)
        if (node.arguments.length > 1 || (node.arguments[0] && node.arguments[0].type !== 'ObjectExpression')) {
          context.report({ node, message: 'Declare feature flag overrides as an object of boolean literals.' })
        } else if (
          node.arguments[0]?.properties.some(
            property =>
              property.type !== 'Property' ||
              property.computed ||
              property.value.type !== 'Literal' ||
              typeof property.value.value !== 'boolean',
          )
        ) {
          context.report({ node, message: 'Feature flag overrides must have literal keys and boolean values.' })
        }
      },
      'Program:exit'() {
        mutations.forEach(({ node, ancestors }) => {
          const inHook = ancestors.some(
            ancestor => ancestor.type === 'CallExpression' && hookNames.has(callName(ancestor.callee)),
          )
          if (inHook && /\.cy\.[jt]sx?$/.test(context.getFilename())) {
            context.report({
              node,
              message:
                'Declare hook feature flags in setupFeatureFlags; direct toggles are reserved for actions inside a test.',
            })
          }
        })
      },
    }
  },
}
