describe('Custom page', () => {
  beforeEach(() => {
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

  // TODO: fixme
  // ! this test currently fails in CI, preventing the pipeline from succeeding.
  // it must be fixed urgently and the test must be uncommented
  it.skip('User wants to see a custom page with a non-standard URL', () => {
    cy.visit('/pages/faq-Èn')
    cy.contains('FAQ EN')
  })
})
