describe('Custom page', () => {
  before(() => {
    cy.task('db:restore')
  })
  it('User wants to see a custom page in french', () => {
    cy.visit('/pages/faq')
    cy.contains('FAQ FR')
  })
  it('User wants to see a custom page in english', () => {
    cy.visit('/pages/faq-en')
    cy.contains('FAQ EN')
  })
})
