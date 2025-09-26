describe('User profile types page', () => {
  before(() => {
    // ? NOTE: not restoring DB here since we only check that the page and content loads and is visible, and we don't perform mutations.
    // ? Restoring DB would make the test slower and is not necessary at this point.
    cy.task('enable:feature', 'user_type')
  })

  // This feature is not largely used as of 2025, so we just check that the page loads and displays userType cards without error
  it('views user types page when logged in as admin', () => {
    cy.directLoginAs('admin')
    cy.interceptGraphQLOperation({ operationName: 'userTypes_Query' })
    cy.visit('/admin-next/user-types')
    cy.wait('@userTypes_Query', { timeout: 5000 }).its('response.statusCode').should('not.eq', 500)
    cy.get('.user-type-card').should('have.length.greaterThan', 0)
  })
})
