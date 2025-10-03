Cypress.Commands.add('checkTableLength', (length: number) => {
  cy.get('.cap-table__tbody .cap-table__tr').should('have.length', length)
})
