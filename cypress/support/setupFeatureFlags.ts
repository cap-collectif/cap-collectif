type ConfiguredSuite = Mocha.Suite & { capcoFeatureFlags?: Record<string, boolean> }

// Suite declarations are collected before the shared beforeEach prepares Redis.
export const setupFeatureFlags = (overrides: Record<string, boolean> = {}) => {
  before(function () {
    const suite = this.test?.parent as ConfiguredSuite | undefined
    if (!suite) throw new Error('Feature flag overrides must belong to a test suite.')
    // Cypress bundles support and spec imports separately; store metadata on the shared Mocha suite.
    suite.capcoFeatureFlags = { ...overrides }
  })
}

export const prepareTestFeatureFlags = (test: Mocha.Test) => {
  const ancestors: ConfiguredSuite[] = []
  for (let suite = test.parent; suite; suite = suite.parent) ancestors.unshift(suite)
  const overrides = Object.assign({}, ...ancestors.map(suite => suite.capcoFeatureFlags))
  return cy.task('reset:feature-flags', overrides)
}
