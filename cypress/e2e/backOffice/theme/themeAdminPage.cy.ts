describe('Theme Admin Page', () => {
  const visitThemesPage = () => {
    cy.visit('/admin-next/themes', { failOnStatusCode: false })
  }

  const rowFor = (title: string) => cy.contains(title).closest('tr')

  const selectLanguage = (label: string) => {
    cy.get('#multilingual .cap-select__control').filter(':visible').click()
    cy.contains('.cap-select__option', label).click()
  }

  beforeEach(() => {
    cy.task('db:restore')
    cy.task('enable:feature', 'unstable__sonata_migration_to_admin_next')
  })

  after(() => {
    cy.task('disable:feature', 'unstable__sonata_migration_to_admin_next')
    cy.task('disable:feature', 'multilangue')
  })

  it('redirects a non-admin account to 403 page', () => {
    cy.directLoginAs('project_owner')
    visitThemesPage()
    cy.url().should('contain', '/admin-next/403')
    cy.contains('unauthorized-access').should('be.visible')
  })

  it('searches a theme while keeping the search field', () => {
    cy.directLoginAs('admin')
    cy.interceptGraphQLOperation({ operationName: 'themes_Query' })
    visitThemesPage()
    cy.wait('@themes_Query')

    cy.interceptGraphQLOperation({ operationName: 'ThemeListPaginationQuery' })
    cy.get('div.cap-search').click({ force: true }).type('Justi')
    cy.wait('@ThemeListPaginationQuery')

    cy.contains('Justice').should('be.visible')
    cy.contains('Transport').should('not.exist')
    // Only the list reloads: the search field is not remounted and keeps the typed text
    cy.get('div.cap-search input').should('have.value', 'Justi').and('have.focus')
  })

  it('creates a theme', () => {
    const title = `My new theme ${Date.now()}`

    cy.directLoginAs('admin')
    cy.interceptGraphQLOperation({ operationName: 'themes_Query' })
    visitThemesPage()
    cy.wait('@themes_Query')

    cy.contains('button', 'admin.themes.create').click()
    cy.get('#FR_FR-title').filter(':visible').clear().type(title, { delay: 0 })

    cy.interceptGraphQLOperation({ operationName: 'CreateThemeMutation' })
    cy.contains('button', 'btn_create').filter(':visible').click()
    // GraphQL answers 200 even on failure, so assert on the payload rather than the HTTP status.
    cy.wait('@CreateThemeMutation').its('response.body.data.createTheme.errorCode').should('eq', null)

    cy.interceptGraphQLOperation({ operationName: 'themes_Query' })
    visitThemesPage()
    cy.wait('@themes_Query')
    rowFor(title).within(() => {
      cy.contains('global.yes').should('be.visible')
    })
  })

  it('updates a theme', () => {
    const title = 'Justice'
    const updatedTitle = `${title} updated`

    cy.directLoginAs('admin')
    cy.interceptGraphQLOperation({ operationName: 'themes_Query' })
    visitThemesPage()
    cy.wait('@themes_Query')

    rowFor(title).contains('a', title).click()
    cy.get('#FR_FR-title').filter(':visible').should('have.value', title)

    cy.get('#FR_FR-title').filter(':visible').clear().type(updatedTitle, { delay: 0 })
    cy.get('.cap-switch__slider').click()

    cy.interceptGraphQLOperation({ operationName: 'UpdateThemeMutation' })
    cy.contains('button', 'global.save').filter(':visible').click()
    cy.wait('@UpdateThemeMutation').its('response.body.data.updateTheme.errorCode').should('eq', null)

    // Reload to confirm the changes were actually persisted, not just an optimistic UI update.
    cy.interceptGraphQLOperation({ operationName: 'themes_Query' })
    visitThemesPage()
    cy.wait('@themes_Query')
    rowFor(updatedTitle).within(() => {
      cy.contains('global.no').should('be.visible')
    })
  })

  it('shows the errors of another locale when saving', () => {
    cy.task('enable:feature', 'multilangue')
    cy.directLoginAs('admin')
    cy.interceptGraphQLOperation({ operationName: 'ThemeFormWrapperQuery' })
    cy.visit('/admin-next/theme?id=theme2', { failOnStatusCode: false })
    cy.wait('@ThemeFormWrapperQuery')

    // The multilingual accordion is collapsed by default and CapUI does not render a collapsed panel
    cy.get('#accordion-button-multilingual').click()
    selectLanguage('english')
    cy.get('#EN_GB-title').filter(':visible').clear().type('a'.repeat(256), { delay: 0 })
    selectLanguage('french')

    // The english error is hidden: saving must stay possible and bring it back on screen
    cy.contains('button', 'global.save').filter(':visible').should('be.enabled').click()
    cy.get('#EN_GB-title').filter(':visible').should('exist')
    cy.contains('characters-maximum').should('be.visible')
  })

  it('shows a not found message for an unknown theme', () => {
    cy.directLoginAs('admin')
    cy.visit('/admin-next/theme?id=unknown-theme', { failOnStatusCode: false })

    cy.contains('the-page-you-are-looking-for-cant-be-found').should('be.visible')
    cy.contains('button', 'global.save').should('not.exist')
  })

  it('deletes a theme', () => {
    const title = 'Thème vide'

    cy.directLoginAs('admin')
    cy.interceptGraphQLOperation({ operationName: 'themes_Query' })
    visitThemesPage()
    cy.wait('@themes_Query')

    rowFor(title).within(() => {
      cy.get('button[aria-label="admin.themes.delete"]').click()
    })
    cy.get('[data-cy="deletion-confirmation"]').click()
    cy.contains(title).should('not.exist')
  })
})
