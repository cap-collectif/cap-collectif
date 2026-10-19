// Opt in per suite while legacy suites are migrated to deterministic flag setup.
export const setupFeatureFlags = (overrides: Record<string, boolean> = {}) => {
  beforeEach(() => {
    cy.task('reset:feature-flags', overrides)
  })

  // Protect legacy neighbours and the local environment after the suite finishes.
  after(() => {
    cy.task('reset:feature-flags', {})
  })
}
