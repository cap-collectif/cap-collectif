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

beforeEach(() => {
  // Looks like we need to force reload because of a weird issue causing Cypress to not always clears
  // cookies, thus persisting PHPSESSID between tests and so the user can sometimes be already connected
  // see https://github.com/cypress-io/cypress/issues/781
  cy.reload(true)
  cy.appendOperationToGraphQLFetch()
})
