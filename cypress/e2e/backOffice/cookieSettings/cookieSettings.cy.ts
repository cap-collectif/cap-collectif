type Translation = { locale: string; value: string }

describe('Cookie settings back office', () => {
  const visitCookieSettingsPage = () => {
    cy.visit('/admin-next/cookie-settings', { failOnStatusCode: false })
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
    visitCookieSettingsPage()
    cy.url().should('contain', '/admin-next/403')
    cy.contains('unauthorized-access').should('be.visible')
  })

  it('edits the cookie list in several languages as admin', () => {
    cy.task('enable:feature', 'unstable__sonata_migration_to_admin_next')
    cy.task('enable:feature', 'multilangue')
    cy.directLoginAs('admin')
    cy.interceptGraphQLOperation({ operationName: 'CookieSettingsFormQuery' })
    visitCookieSettingsPage()
    cy.wait('@CookieSettingsFormQuery').its('response.statusCode').should('not.eq', 500)

    editor().should('contain', 'Cookies internes').clear().type('Liste des cookies', { delay: 0 })

    selectLanguage('english')
    editor().should('not.contain', 'Liste des cookies').type('Cookie list', { delay: 0 })

    // Switching back to french keeps the text typed before, even though it is not saved yet.
    selectLanguage('french')
    editor().should('contain', 'Liste des cookies')

    cy.interceptGraphQLOperation({ operationName: 'UpdateCookieSettingMutation' })
    cy.contains('button', 'global.save').filter(':visible').click()
    cy.wait('@UpdateCookieSettingMutation')
      .its('response.body.data.updateCookieSetting')
      .should(payload => {
        const { errorCode, siteParameter } = payload
        const { translations }: { translations: Translation[] } = siteParameter
        const hasText = (locale: string, text: string) =>
          translations.some(translation => translation.locale === locale && translation.value.includes(text))
        assert.isNull(errorCode, JSON.stringify(payload))
        assert.isTrue(hasText('fr-FR', 'Liste des cookies'), JSON.stringify(translations))
        assert.isTrue(hasText('en-GB', 'Cookie list'), JSON.stringify(translations))
      })
    cy.contains('global.changes.saved').should('be.visible')

    // Reloading the page shows the saved text of each language.
    visitCookieSettingsPage()
    editor().should('contain', 'Liste des cookies')
    selectLanguage('english')
    editor().should('contain', 'Cookie list')

    cy.task('disable:feature', 'unstable__sonata_migration_to_admin_next')
  })
})
