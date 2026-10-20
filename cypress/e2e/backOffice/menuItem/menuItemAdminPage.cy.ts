describe('Menu items back office', () => {
  const visitMenuItemsPage = () => {
    cy.interceptGraphQLOperation({ operationName: 'menuItems_Query' })
    cy.visit('/admin-next/menu-items', { failOnStatusCode: false })
    cy.wait('@menuItems_Query')
  }

  const rowFor = (title: string) => cy.contains('a', title).closest('tr')

  beforeEach(() => {
    cy.task('db:restore')
  })

  it('redirects a non-admin account to 403 page', () => {
    cy.directLoginAs('project_owner')
    cy.visit('/admin-next/menu-items', { failOnStatusCode: false })
    cy.url().should('contain', '/admin-next/403')
  })

  it('redirects a non-admin account to 403 page from the edition page', () => {
    cy.directLoginAs('project_owner')
    cy.visit('/admin-next/menu-item', { failOnStatusCode: false })
    cy.url().should('contain', '/admin-next/403')
  })

  it('creates a menu item with an external link', () => {
    const title = 'Help center'

    cy.directLoginAs('admin')
    visitMenuItemsPage()

    cy.contains('button', 'admin.menu-items.create').click()
    cy.get('#FR_FR-title').clear().type(title, { delay: 0 })
    cy.get('#isExternalLink').should('be.disabled')
    cy.get('#FR_FR-link').clear().type('https://help.example.com', { delay: 0 })
    cy.contains('label', 'admin.menu-items.external-link').click()
    cy.get('#position').type('20', { delay: 0 })

    cy.contains('button', 'btn_create').click()

    // On success the form reloads the edit page of the new item, so its fields come from the server.
    cy.url().should('contain', '/admin-next/menu-item?id=')
    cy.get('#FR_FR-title').should('have.value', title)
    cy.get('#FR_FR-link').should('have.value', 'https://help.example.com')
    cy.get('#isExternalLink').should('be.checked')
    cy.get('#position').should('have.value', '20')
  })

  it('updates a menu item', () => {
    const title = 'Lien externe'
    const updatedTitle = `${title} updated`

    cy.directLoginAs('admin')
    visitMenuItemsPage()

    rowFor(title).contains('a', title).click()
    cy.get('#FR_FR-title').should('have.value', title).clear().type(updatedTitle, { delay: 0 })
    cy.get('.cap-switch__slider').click()

    cy.contains('button', 'global.save').click()
    cy.contains('admin.update.successful').should('be.visible')

    visitMenuItemsPage()
    // The row can sit below the fold of the scrollable content area, where Cypress considers it clipped
    rowFor(updatedTitle)
      .scrollIntoView()
      .within(() => {
        cy.contains('global.no').should('be.visible')
      })
  })

  it('locks the link and the deletion of a mandatory item', () => {
    cy.directLoginAs('admin')
    visitMenuItemsPage()

    rowFor('Contact').within(() => {
      cy.get('button[aria-label^="admin.menu-items.delete"]').should('not.exist')
    })
    rowFor('Contact').contains('a', 'Contact').click()
    cy.get('#FR_FR-link').should('have.value', 'contact').and('be.disabled')
    cy.get('#isExternalLink').should('be.disabled')
    cy.contains('button', 'admin.global.delete').should('not.exist')
  })

  it('deletes a menu item', () => {
    const title = 'Lien externe'

    cy.directLoginAs('admin')
    visitMenuItemsPage()

    rowFor(title).within(() => {
      cy.get('button[aria-label^="admin.menu-items.delete"]').click()
    })
    cy.get('[data-cy="deletion-confirmation"]').click()
    cy.contains('admin.menu-items.successfully-deleted').should('be.visible')
    cy.contains('a', title).should('not.exist')

    // Reload to confirm the deletion was persisted, not just removed from the Relay store
    visitMenuItemsPage()
    cy.contains('a', title).should('not.exist')
  })
})
