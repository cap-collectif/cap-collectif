describe('Notification settings back office', () => {
  const visitNotificationSettingsPage = () => {
    cy.visit('/admin-next/notification-settings', { failOnStatusCode: false })
  }

  before(() => {
    cy.task('db:restore')
  })

  it('redirects a non-admin account away from the notification settings page', () => {
    cy.directLoginAs('project_owner')
    visitNotificationSettingsPage()
    cy.url().should('contain', '/admin-next/403')
    cy.contains('unauthorized-access').should('be.visible')
  })

  it('edits a notification setting as admin', () => {
    cy.directLoginAs('admin')
    cy.interceptGraphQLOperation({ operationName: 'NotificationSettingsListQuery' })
    visitNotificationSettingsPage()
    cy.wait('@NotificationSettingsListQuery').its('response.statusCode').should('not.eq', 500)

    cy.contains('admin.mail.notifications.send_name')
      .closest('tr')
      .within(() => cy.get('button[aria-label="global.edit"]').click())

    cy.get('#value').filter(':visible').clear().type('Notifications', { delay: 0 })
    cy.interceptGraphQLOperation({ operationName: 'UpdateNotificationSettingMutation' })
    cy.contains('button', 'global.save').filter(':visible').click()
    cy.wait('@UpdateNotificationSettingMutation').its('response.statusCode').should('not.eq', 500)
    cy.contains('global.changes.saved').should('be.visible')
    cy.contains('Notifications').should('be.visible')
  })
})
