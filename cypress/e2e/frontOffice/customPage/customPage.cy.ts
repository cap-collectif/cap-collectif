/**
 * @cypress-status compliant
 * @cypress-reason Checks translated and encoded page URLs against server-rendered content.
 */
describe('Custom page translations', () => {
  before(() => {
    cy.task('db:restore')
  })

  // The default French page is already covered by publicNextRoutesSmoke.cy.ts.
  it('renders the English translation selected by its slug', () => {
    cy.visit('/pages/faq-en')
    cy.contains('h1', 'FAQ EN').should('be.visible')
  })

  it('normalizes accents and case in an encoded page URL', () => {
    cy.visit(encodeURI('/pages/faq-Èn'))
    cy.contains('h1', 'FAQ EN').should('be.visible')
  })
})
