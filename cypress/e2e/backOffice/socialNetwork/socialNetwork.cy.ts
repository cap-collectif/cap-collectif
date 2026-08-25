describe('Social networks back office', () => {
  const visitSocialNetworksPage = () => {
    // A non-admin account gets redirected to `/admin-next/403`, which responds with an actual
    // HTTP 403 status code (see `pages/admin-next/403.tsx`) — disable the status check so this
    // helper still works for the "redirected away" test case.
    cy.visit('/admin-next/social-networks', { failOnStatusCode: false })
  }

  const fillVisibleField = (fieldId: string, value: string) => {
    cy.get(`#${fieldId}`).filter(':visible').clear().type(value, { delay: 0 })
  }

  const clickVisibleButton = (label: string) => {
    cy.contains('button', label).filter(':visible').click()
  }

  const waitForSuccessToast = (messageId: string) => {
    cy.contains(messageId).should('be.visible')
  }

  it('redirects a non-ROLE_ADMIN account away from the social networks page', () => {
    cy.directLoginAs('project_owner')
    visitSocialNetworksPage()
    cy.url().should('contain', '/admin-next/403')
    cy.contains('unauthorized-access').should('be.visible')
  })

  it('creates, edits and deletes a social network through the back office', () => {
    const title = `Cypress social network ${Date.now()}`
    const updatedTitle = `${title} updated`
    const link = 'https://cypress.example.com'

    cy.directLoginAs('admin')
    cy.interceptGraphQLOperation({ operationName: 'SocialNetworkListQuery' })
    visitSocialNetworksPage()
    cy.wait('@SocialNetworkListQuery')

    clickVisibleButton('admin.social-network.create-button')
    fillVisibleField('title', title)
    fillVisibleField('link', link)
    fillVisibleField('position', '99')
    clickVisibleButton('global.add')
    waitForSuccessToast('global.changes.saved')

    cy.contains(title)
      .closest('tr')
      .within(() => {
        cy.contains(link)
        cy.get('button[aria-label="global.edit"]').click()
      })

    fillVisibleField('title', updatedTitle)
    clickVisibleButton('global.save')
    waitForSuccessToast('global.changes.saved')

    cy.contains(updatedTitle)
      .closest('tr')
      .within(() => {
        cy.get('button[aria-label="global.delete"]').click()
      })
    clickVisibleButton('global.delete')
    waitForSuccessToast('global.deleted')

    cy.contains(updatedTitle).should('not.exist')
  })
})
