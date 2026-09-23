describe('Appearance settings back office', () => {
  const visitAppearanceSettingsPage = () => cy.visit('/admin-next/appearance-settings', { failOnStatusCode: false })

  before(() => {
    cy.task('db:restore')
  })

  it('redirects a non-admin account away from the appearance settings page', () => {
    cy.directLoginAs('project_owner')
    visitAppearanceSettingsPage()
    cy.url().should('contain', '/admin-next/403')
  })

  it('edits an appearance color as admin', () => {
    cy.directLoginAs('admin')
    cy.interceptGraphQLOperation({ operationName: 'AppearanceSettingsListQuery' })
    visitAppearanceSettingsPage()
    cy.wait('@AppearanceSettingsListQuery').its('response.statusCode').should('not.eq', 500)

    cy.get('button[aria-label="global.edit"]').first().should('be.visible').click()
    cy.get('#value').filter(':visible').should('exist')
  })
})
