describe('Contributions BO - arguments page', () => {
  beforeEach(() => {
    cy.task('db:restore')
    cy.directLoginAs('admin')
  })

  it('views arguments page when logged in as admin', () => {
    cy.interceptGraphQLOperation({ operationName: 'AdminRightNavbarAppQuery' })
    cy.visit('/admin/capco/app/argument/list')
    Cypress.on('uncaught:exception', (err, runnable) => {
      // returning false here prevents Cypress from failing the test
      return false
    })
    cy.wait('@AdminRightNavbarAppQuery').its('response.statusCode').should('not.eq', 500)
    cy.get('table tr').should('have.length.greaterThan', 20)
  })
})
