// ***********************************************************
// This example support/index.ts is processed and
// loaded automatically before your test files.
//
// This is a great place to put global configuration and
// behavior that modifies Cypress.
//
// You can change the location of this file or turn off
// automatically serving support files with the
// 'supportFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/configuration
// ***********************************************************

import './commands'
import './mailcatcher'
import { prepareTestFeatureFlags } from './setupFeatureFlags'

Cypress.on('uncaught:exception', err => {
  const resizeObserverErrors = [
    'ResizeObserver loop limit exceeded',
    'ResizeObserver loop completed with undelivered notifications',
  ]

  if (resizeObserverErrors.some(substring => err.message.includes(substring))) {
    return false
  }
})

beforeEach(function () {
  cy.appendOperationToGraphQLFetch()
  if (!this.currentTest) throw new Error('Feature flags require a running Cypress test.')
  prepareTestFeatureFlags(this.currentTest)
})

afterEach(() => {
  cy.task('reset:feature-flags', {})
})
