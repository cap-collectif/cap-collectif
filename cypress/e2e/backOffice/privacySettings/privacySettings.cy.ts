describe('Privacy settings back office', () => {
  const visitPrivacySettingsPage = () => {
    // as non-admin, the query is never sent and thus should not be waited for
    cy.visit('/admin-next/privacy-settings', { failOnStatusCode: false })
  }

  const visitPrivacySettingsPageAsAdmin = () => {
    cy.interceptGraphQLOperation({ operationName: 'PrivacySettingsFormQuery' })
    visitPrivacySettingsPage()
    cy.wait('@PrivacySettingsFormQuery').its('response.statusCode').should('not.eq', 500)
  }

  const saveSettings = () => {
    cy.interceptGraphQLOperation({ operationName: 'UpdatePrivacySettingMutation' })
    cy.contains('button', 'global.save').filter(':visible').click()
    cy.wait('@UpdatePrivacySettingMutation')
  }

  const selectLanguage = (label: string) => {
    cy.get('.cap-select__control').filter(':visible').click()
    cy.contains('.cap-select__option', label).click()
  }

  const editor = () => cy.get('.jodit-wysiwyg').filter(':visible')

  before(() => {
    cy.task('db:restore')
    cy.task('enable:feature', 'multilangue')
    cy.task('enable:feature', 'unstable__sonata_migration_to_admin_next')
  })

  after(() => {
    cy.task('disable:feature', 'multilangue')
    cy.task('disable:feature', 'unstable__sonata_migration_to_admin_next')
  })

  it('redirects a non-admin account to 403 page', () => {
    cy.directLoginAs('project_owner')
    visitPrivacySettingsPage()
    cy.url().should('contain', '/admin-next/403')
    cy.contains('unauthorized-access').should('be.visible')
  })

  it('edits the privacy policy in several languages as admin', () => {
    cy.directLoginAs('admin')
    visitPrivacySettingsPageAsAdmin()

    // The fixture policy is so long that the editor is taller than the viewport: its center can never be
    // scrolled into view, so the actionability check has to be skipped to clear it.
    editor().should('contain', 'Dernière mise à jour').clear({ force: true }).type('Politique de confidentialité')

    selectLanguage('english')
    editor().should('not.contain', 'Politique de confidentialité').type('Privacy policy')

    // Switching back to french keeps the text typed before, even though it is not saved yet.
    selectLanguage('french')
    editor().should('contain', 'Politique de confidentialité')

    saveSettings()
    cy.contains('global.changes.saved').should('exist').and('be.visible')

    // Reloading the page shows the saved text of each language.
    visitPrivacySettingsPageAsAdmin()
    editor().should('contain', 'Politique de confidentialité')
    selectLanguage('english')
    editor().should('contain', 'Privacy policy')
  })
})
