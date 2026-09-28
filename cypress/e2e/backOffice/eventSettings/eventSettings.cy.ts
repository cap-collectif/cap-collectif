describe('Event settings back office', () => {
  beforeEach(() => {
    cy.task('db:restore')
  })

  it('views and edits event settings as admin', () => {
    cy.directLoginAs('admin')
    cy.interceptGraphQLOperation({ operationName: 'EventSettingsListQuery' })
    cy.visit('/admin-next/event-settings')
    cy.wait('@EventSettingsListQuery').its('response.statusCode').should('not.eq', 500)

    cy.contains('events.jumbotron.title')
      .closest('tr')
      .within(() => {
        cy.get('button[aria-label="global.edit"]').click()
      })

    cy.get('[id$="-value"]').filter(':visible').clear().type('12', { delay: 0 })
    cy.contains('button', 'global.save').filter(':visible').click()
    cy.contains('events.jumbotron.title').closest('tr').should('contain', '12')
  })

  it('rejects an event social network description longer than 160 characters', () => {
    cy.directLoginAs('admin')
    cy.visit('/admin-next/event-settings')

    cy.contains('event.metadescription')
      .closest('tr')
      .within(() => {
        cy.get('button[aria-label="global.edit"]').click()
      })

    cy.interceptGraphQLOperation({ operationName: 'UpdateEventSettingMutation' })
    cy.get('[id$="-value"]').filter(':visible').clear().type('a'.repeat(161), { delay: 0 })
    cy.contains('button', 'global.save').filter(':visible').click()
    cy.wait('@UpdateEventSettingMutation')
      .its('response.body.data.updateEventSetting.errorCode')
      .should('eq', 'EVENT_PARAMETER_INVALID_VALUE')
  })
})
