describe('Comments moderation', () => {
  beforeEach(() => {
    cy.task('db:restore')
  })

  it('should view comments moderation page and its content', () => {
    cy.interceptGraphQLOperation({ operationName: 'AdminRightNavbarAppQuery' })
    cy.directLoginAs('admin')
    cy.visit('/admin/capco/app/comment/list')
    Cypress.on('uncaught:exception', (err, runnable) => {
      // returning false here prevents Cypress from failing the test
      return false
    })
    cy.wait('@AdminRightNavbarAppQuery', { timeout: 10000 })
    cy.get('a').contains('global.contenu').should('exist').and('be.visible')
    cy.get('table tbody tr').should('have.length.greaterThan', 23)
  })
})
