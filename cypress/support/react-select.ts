Cypress.Commands.add('assertReactSelectOptionCount', (selector: string, value: number) => {
  cy.get(`${selector} .react-select__placeholder`).should('have.length', value)
})

Cypress.Commands.add('selectReactSelectOption', (selector: string, query: string) => {
  cy.get(selector).click().wait(3000)
  cy.contains(query, { timeout: 10000 })
  cy.get('body').type('{enter}')
})