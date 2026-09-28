describe('Member settings back office', () => {
  beforeEach(() => {
    cy.task('db:restore')
    cy.task('enable:feature', 'members_list')
  })

  it('views and edits member settings as admin', () => {
    cy.directLoginAs('admin')
    cy.interceptGraphQLOperation({ operationName: 'MemberSettingsListQuery' })
    cy.visit('/admin-next/member-settings')
    cy.wait('@MemberSettingsListQuery').its('response.statusCode').should('not.eq', 500)

    cy.contains('members.jumbotron.title')
      .closest('tr')
      .within(() => {
        cy.get('button[aria-label="global.edit"]').click()
      })

    cy.get('[id$="-value"]').filter(':visible').clear().type('Members', { delay: 0 })
    cy.contains('button', 'global.save').filter(':visible').click()
    cy.contains('members.jumbotron.title').closest('tr').should('contain', 'Members')
  })

  it('rejects a member social network description longer than 160 characters', () => {
    cy.directLoginAs('admin')
    cy.visit('/admin-next/member-settings')

    cy.contains('members.metadescription')
      .closest('tr')
      .within(() => {
        cy.get('button[aria-label="global.edit"]').click()
      })

    cy.interceptGraphQLOperation({ operationName: 'UpdateMemberSettingMutation' })
    cy.get('[id$="-value"]').filter(':visible').clear().type('a'.repeat(161), { delay: 0 })
    cy.contains('button', 'global.save').filter(':visible').click()
    cy.wait('@UpdateMemberSettingMutation').its('response.body.data.updateMemberSetting.errorCode').should('eq', 'INVALID_VALUE')
  })
})
