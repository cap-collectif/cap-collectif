describe('Admin access to BO & project settings', () => {
  before(() => {
    cy.task('db:restore')
    cy.directLoginAs('admin')
  })

  it('displays general settings page', () => {
    cy.interceptGraphQLOperation({ operationName: 'AdminRightNavbarAppQuery' })
    cy.visit('/admin/settings/settings.global/list')
    Cypress.on('uncaught:exception', (err, runnable) => {
      // returning false here prevents Cypress from failing the test
      return false
    })
    cy.wait('@AdminRightNavbarAppQuery', { timeout: 10000 }).its('response.statusCode').should('not.eq', 500)
    cy.get('error.500').should('not.exist')
  })
  it('finds non-generated fonts', () => {
    cy.request('/fonts/openSans/OpenSans-Bold.ttf')
    Cypress.on('uncaught:exception', (err, runnable) => {
      // returning false here prevents Cypress from failing the test
      return false
    })
    cy.get('error.404').should('not.exist')
  })
})
