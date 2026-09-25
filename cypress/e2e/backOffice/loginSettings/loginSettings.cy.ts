type Translation = { locale: string; value: string }

describe('Login settings back office', () => {
  const visitLoginSettingsPage = () => {
    cy.visit('/admin-next/login-settings', { failOnStatusCode: false })
  }

  const openTopTextModal = () => {
    cy.contains('login.text.top')
      .closest('tr')
      .within(() => cy.get('button[aria-label="global.edit"]').click())
  }

  const selectLanguage = (label: string) => {
    cy.get('.cap-select__control').filter(':visible').click()
    cy.contains('.cap-select__option', label).click()
  }

  const editor = () => cy.get('.jodit-wysiwyg').filter(':visible')

  before(() => {
    cy.task('db:restore')
  })

  after(() => {
    cy.task('disable:feature', 'multilangue')
  })

  it('redirects a non-admin account to 403 page', () => {
    cy.directLoginAs('project_owner')
    visitLoginSettingsPage()
    cy.url().should('contain', '/admin-next/403')
    cy.contains('unauthorized-access').should('be.visible')
  })

  it('edits the login texts in several languages as admin', () => {
    cy.task('enable:feature', 'unstable__sonata_migration_to_admin_next')
    cy.task('enable:feature', 'multilangue')
    cy.directLoginAs('admin')
    cy.interceptGraphQLOperation({ operationName: 'LoginSettingsListQuery' })
    visitLoginSettingsPage()
    cy.wait('@LoginSettingsListQuery').its('response.statusCode').should('not.eq', 500)

    openTopTextModal()
    editor().should('contain', 'Je suis un texte').clear().type('Texte du haut', { delay: 0 })

    selectLanguage('english')
    editor().should('not.contain', 'Texte du haut').type('Top text', { delay: 0 })

    // Switching back to french keeps the text typed before, even though it is not saved yet.
    selectLanguage('french')
    editor().should('contain', 'Texte du haut')

    cy.interceptGraphQLOperation({ operationName: 'UpdateLoginSettingMutation' })
    cy.contains('button', 'global.save').filter(':visible').click()
    cy.wait('@UpdateLoginSettingMutation')
      .its('response.body.data.updateLoginSetting')
      .should(payload => {
        const { errorCode, siteParameter } = payload
        const { translations }: { translations: Translation[] } = siteParameter
        const hasText = (locale: string, text: string) =>
          translations.some(translation => translation.locale === locale && translation.value.includes(text))
        assert.isNull(errorCode, JSON.stringify(payload))
        assert.isTrue(hasText('fr-FR', 'Texte du haut'), JSON.stringify(translations))
        assert.isTrue(hasText('en-GB', 'Top text'), JSON.stringify(translations))
      })
    cy.contains('global.changes.saved').should('be.visible')

    // Reopening the modal shows the saved text of each language.
    openTopTextModal()
    editor().should('contain', 'Texte du haut')
    selectLanguage('english')
    editor().should('contain', 'Top text')
  })
})
