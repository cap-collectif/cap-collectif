Cypress.Commands.add('assertReactSelectOptionCount', (selector: string, value: number) => {
  cy.get(`${selector} .react-select__input input`).should('have.length', value)
})

Cypress.Commands.add('selectReactSelectOption', (selector: string, query: string) => {
  cy.get(selector).click().wait(3000)
  cy.contains(query, { timeout: 10000 })
  cy.get('body').type('{enter}')
})

Cypress.Commands.add('selectReactSetOption', (selector: string, query: string) => {
  cy.get(`${selector} .react-select__input input`).focus().type(`${query} {enter}`, { force: true })
})

Cypress.Commands.add('selectReactSelectFirstOption', (selector: string) => {
  cy.get(`${selector} .react-select__option:first-child`).click({ force: true })
})

Cypress.Commands.add('selectDSSelectFirstOption', () => {
  cy.get(`.cap-select__option:first-child`).click({ force: true })
})

Cypress.Commands.add('openDSSelect', (selector: string) => {
  cy.get(`${selector} .cap-select__input`).click({
    force: true,
  })
})
