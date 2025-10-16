describe('Contributions BO - sources page', () => {
  before(() => {
    cy.task('db:restore')
    cy.directLoginAs('admin')
  })

  it('views sources page when logged in as admin', () => {
    cy.interceptGraphQLOperation({ operationName: 'AdminRightNavbarAppQuery' })
    cy.visit('/admin/capco/app/source/list')
    Cypress.on('uncaught:exception', (err, runnable) => {
      // returning false here prevents Cypress from failing the test
      return false
    })
    cy.wait('@AdminRightNavbarAppQuery', { timeout: 10000 }).its('response.statusCode').should('not.eq', 500)
    cy.get('table tr').should('have.length.greaterThan', 20)
  })
})
