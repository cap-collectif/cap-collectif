describe('Source categories page', () => {
  beforeEach(() => {
    cy.task('db:restore')
  })

  // This feature is reserved to super admins and rarely used, so we just check that the page loads and displays data without error
  it('views source categories page when logged in as super admin', () => {
    cy.directLoginAs('super_admin')
    cy.interceptGraphQLOperation({ operationName: 'sourceCategories_Query' })
    cy.visit('/admin-next/source-categories')
    cy.wait('@sourceCategories_Query').its('response.statusCode').should('not.eq', 500)
    cy.get('.cap-table__tbody').children().should('have.length.greaterThan', 0)
  })
})
