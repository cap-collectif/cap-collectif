describe('Contributions BO - opinion versions list page', () => {
  beforeEach(() => {
    cy.task('db:restore')
  })
  it('displays admin opinion list page ', () => {
    cy.directLoginAs('admin')
    cy.interceptGraphQLOperation({ operationName: 'AdminRightNavbarAppQuery' })
    cy.visit('/admin/capco/app/opinionversion/list')
    Cypress.on('uncaught:exception', (err, runnable) => {
      // returning false here prevents Cypress from failing the test
      return false
    })
    cy.wait('@AdminRightNavbarAppQuery', { timeout: 10000 }).its('response.statusCode').should('not.eq', 500)
    cy.get('error.500').should('not.exist')
    cy.get('table tr').should('have.length.greaterThan', 20)
  })
})
