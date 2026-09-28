describe('Theme settings back office', () => {
  beforeEach(() => {
    cy.task('db:restore')
  })

  it('views and edits theme settings as admin', () => {
    cy.directLoginAs('admin')
    cy.interceptGraphQLOperation({ operationName: 'ThemeSettingsListQuery' })
    cy.visit('/admin-next/theme-settings')
    cy.wait('@ThemeSettingsListQuery').its('response.statusCode').should('not.eq', 500)

    cy.contains('themes.picto').closest('tr').find('img').should('have.attr', 'src')

    cy.contains('themes.jumbotron.title')
      .closest('tr')
      .within(() => {
        cy.get('button[aria-label="global.edit"]').click()
      })

    cy.get('[id$="-value"]').filter(':visible').clear().type('Themes', { delay: 0 })
    cy.contains('button', 'global.save').filter(':visible').click()
    cy.contains('themes.jumbotron.title').closest('tr').should('contain', 'Themes')
  })

  it('rejects a theme social network description longer than 160 characters', () => {
    cy.directLoginAs('admin')
    cy.visit('/admin-next/theme-settings')

    cy.contains('themes.metadescription')
      .closest('tr')
      .within(() => {
        cy.get('button[aria-label="global.edit"]').click()
      })

    cy.interceptGraphQLOperation({ operationName: 'UpdateThemeSettingMutation' })
    cy.get('[id$="-value"]').filter(':visible').clear().type('a'.repeat(161), { delay: 0 })
    cy.contains('button', 'global.save').filter(':visible').click()
    cy.wait('@UpdateThemeSettingMutation').its('response.body.data.updateThemeSetting.errorCode').should('eq', 'INVALID_VALUE')
  })
})
