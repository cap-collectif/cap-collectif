/**
 * @cypress-status reference
 * @cypress-reason Canonical example for a small back-office CRUD workflow.
 */
describe('Social networks back office', () => {
  before(() => {
    cy.task('db:restore')
  })

  const visitSocialNetworksPage = () => {
    cy.visit('/admin-next/social-networks', { failOnStatusCode: false })
  }

  const fillVisibleField = (fieldId: string, value: string) => {
    cy.get(`#${fieldId}`).filter(':visible').should('exist').and('be.visible').clear().type(value)
  }

  const clickVisibleButton = (label: string) => {
    cy.contains('button', label).filter(':visible').should('exist').and('be.visible').click()
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
        cy.get('button[aria-label="global.edit"]').scrollIntoView().should('exist').and('be.visible').click()
      })

    fillVisibleField('title', updatedTitle)
    clickVisibleButton('global.save')
    waitForSuccessToast('global.changes.saved')

    cy.contains(updatedTitle)
      .closest('tr')
      .within(() => {
        cy.get('button[aria-label="global.delete"]').scrollIntoView().should('exist').and('be.visible').click()
      })
    clickVisibleButton('global.delete')
    waitForSuccessToast('global.deleted')

    cy.contains(updatedTitle).should('not.exist')
  })
})
