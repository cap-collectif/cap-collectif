Cypress.Commands.add('checkAccessDenied', (url: string) => {
  cy.visit(url, {
    failOnStatusCode: false,
  })
  cy.contains('unauthorized-access')
  cy.contains('403-error')
  cy.contains('restricted-access')
})
