describe('Footer social networks back office', () => {
  beforeEach(() => {
    cy.task('db:restore')
    cy.directLoginAs('admin')
  })

  const visitPage = () => {
    cy.visit('/admin-next/footer-social-networks')
  }

  const fillVisibleField = (fieldId: string, value: string) => {
    cy.get(`#${fieldId}`).filter(':visible').clear().type(value, { delay: 0 })
  }

  const rowFor = (title: string) => cy.contains(title).closest('tr')

  const createFooterSocialNetwork = (title: string, link: string) => {
    cy.contains('button', 'admin.footer-social-networks.create').click()
    fillVisibleField('title', title)
    fillVisibleField('link', link)
    cy.contains('button', 'global.add').filter(':visible').click()
  }

  it('creates a footer social network', () => {
    const title = 'Vegan community'

    visitPage()
    createFooterSocialNetwork(title, 'https://www.happycow.net/')

    rowFor(title).within(() => {
      cy.contains('global.yes').should('be.visible')
    })
  })

  it('updates a footer social network', () => {
    const title = 'Linkedin'
    const updatedTitle = `${title} updated`

    visitPage()
    rowFor(title).within(() => {
      cy.get('button[aria-label="global.edit"]').click()
    })
    fillVisibleField('title', updatedTitle)
    cy.get('.cap-switch__slider').click()
    cy.contains('button', 'global.edit').filter(':visible').click()

    rowFor(updatedTitle).within(() => {
      cy.contains('global.no').should('be.visible')
    })

    // Reload to confirm the changes were actually persisted, not just an optimistic UI update.
    visitPage()
    rowFor(updatedTitle).within(() => {
      cy.contains('global.no').should('be.visible')
    })
  })

  it('deletes a footer social network', () => {
    const title = 'Facebook'

    visitPage()
    rowFor(title).within(() => {
      cy.get('button[aria-label="global.edit"]').click()
    })
    cy.contains('button', 'global.delete').filter(':visible').click()
    cy.contains(title).should('not.exist')
  })
})
