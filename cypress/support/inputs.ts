// date inputs
/**
 * @param index - the index of the input in case there are several, e.g. start date and end date inputs
 * @param date - the date to set in the input, format YYYY-MM-DD
 */
Cypress.Commands.add('setCapInputDateTime', (index: number, date: string) => {
  cy.get('input.cap-input[type="datetime-local"]')
    .eq(index)
    .then(input => {
      cy.wrap(input).focus().type(date, { force: true })
    })
})
