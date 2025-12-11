describe('Contributions BO - sources page', () => {
  beforeEach(() => {
    cy.task('db:restore')
    cy.directLoginAs('admin')
  })

  it('views sources page when logged in as admin', () => {
    cy.interceptGraphQLOperation({ operationName: 'AdminRightNavbarAppQuery' })
    cy.visit('/admin/capco/app/source/list')
    cy.wait('@AdminRightNavbarAppQuery').its('response.statusCode').should('not.eq', 500)
    cy.get('table tr').should('have.length.greaterThan', 20)
  })
})
