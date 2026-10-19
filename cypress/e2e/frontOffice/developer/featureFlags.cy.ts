import { setupFeatureFlags } from '../../../support/setupFeatureFlags'

const expectFlags = (expected: Record<string, boolean>) =>
  cy.request('POST', '/graphql/internal', { query: '{ featureFlags { type enabled } }' }).then(({ body }) => {
    assert.isUndefined(body.errors)
    const actual: Record<string, boolean> = {}
    body.data.featureFlags.forEach((flag: { type: string; enabled: boolean }) => {
      actual[flag.type] = flag.enabled
    })
    assert.include(actual, expected)
  })

/**
 * @cypress-status compliant
 * @cypress-reason Checks real Redis flags through GraphQL, including inherited overrides and retry cleanup.
 */
describe('Feature flag isolation', () => {
  setupFeatureFlags({ calendar: false, newsletter: false })

  it('applies suite overrides over the test preset', () => {
    expectFlags({ calendar: false, newsletter: false, blog: true, shield_mode: false })
  })

  it('combines scenario overrides without losing the suite configuration', () => {
    cy.setFeatureFlags({ blog: false, shield_mode: true })
    cy.setFeatureFlags({ captcha: false })
    expectFlags({ calendar: false, newsletter: false, blog: false, shield_mode: true, captcha: false })
  })

  it('keeps the single-flag compatibility commands on the same Redis configuration', () => {
    cy.enableFeatureFlag('shield_mode')
    cy.disableFeatureFlag('blog')
    expectFlags({ calendar: false, newsletter: false, shield_mode: true, blog: false })
  })

  // The first attempt deliberately fails to exercise Cypress's real retry lifecycle.
  it('restores suite overrides before a retry', { retries: 1 }, () => {
    expectFlags({ calendar: false, newsletter: false, blog: true, shield_mode: false })
    if (Cypress.currentRetry === 0) {
      cy.setFeatureFlags({ calendar: true, newsletter: true, shield_mode: true })
      cy.then(() => {
        throw new Error('Intentional failure to verify feature flag retry isolation.')
      })
    } else {
      assert.equal(Cypress.currentRetry, 1)
    }
  })

  describe('Nested overrides', () => {
    setupFeatureFlags({ calendar: true })

    it('overrides one flag and inherits the other parent flags', () => {
      expectFlags({ calendar: true, newsletter: false, blog: true, shield_mode: false })
    })
  })

  describe('Sibling overrides', () => {
    setupFeatureFlags({ shield_mode: true })

    it('inherits its parent without leaking overrides from its sibling', () => {
      expectFlags({ calendar: false, newsletter: false, blog: true, shield_mode: true })
    })
  })

  after(() => {
    expectFlags({ calendar: true, newsletter: true, blog: true, shield_mode: false })
  })
})
