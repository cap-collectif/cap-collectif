describe('Performance settings back office', () => {
  beforeEach(() => {
    cy.task('db:restore')
  })

  const visitPerformanceSettingsPage = () => {
    cy.visit('/admin-next/performance-settings', { failOnStatusCode: false })
  }

  it('views and edits the performance setting as super admin', () => {
    cy.directLoginAs('super_admin')
    cy.interceptGraphQLOperation({ operationName: 'PerformanceSettingsListQuery' })
    visitPerformanceSettingsPage()
    cy.wait('@PerformanceSettingsListQuery').its('response.statusCode').should('not.eq', 500)

    cy.contains('proposal.pagination')
      .closest('tr')
      .within(() => {
        cy.contains('50')
        cy.contains('global.yes')
        cy.get('button[aria-label="global.edit"]').click()
      })

    cy.get('#value').filter(':visible').clear().type('25', { delay: 0 })
    cy.get('.cap-switch__slider').click()
    cy.contains('button', 'global.save').filter(':visible').click()
    cy.contains('global.changes.saved').should('be.visible')

    cy.contains('proposal.pagination')
      .closest('tr')
      .within(() => {
        cy.contains('25')
        cy.contains('global.no')
      })
  })

  it('redirects a non-super-admin away from the page', () => {
    cy.directLoginAs('admin')
    visitPerformanceSettingsPage()
    cy.url().should('contain', '/admin-next/403')
    cy.contains('unauthorized-access').should('be.visible')
  })
})
