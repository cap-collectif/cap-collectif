Cypress.Commands.add('enableFeatureFlag', (flag: string) => {
  return cy.task('enable:feature', flag)
})

Cypress.Commands.add('disableFeatureFlag', (flag: string) => {
  return cy.task('disable:feature', flag)
})
