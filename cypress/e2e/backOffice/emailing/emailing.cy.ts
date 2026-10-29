/**
 * @cypress-status compliant
 * @cypress-reason Back-office creation workflow following the social networks reference test.
 */
describe('Emailing campaigns back office', () => {
  before(() => {
    cy.task('db:restore')
  })

  // CapUI renders the options of a select in a portal at the end of the body
  const selectOption = (controlSelector: string, label: string) => {
    cy.get(controlSelector).filter(':visible').should('exist').and('be.visible').click()
    cy.contains('.cap-select__option', label).should('be.visible').click()
  }

  it('creates a campaign and saves it as a draft', () => {
    const name = `Cypress campaign ${Date.now()}`

    cy.directLoginAs('admin')
    cy.interceptGraphQLOperation({ operationName: 'EmailingCampaignsPageQuery' })
    cy.visit('/admin-next/emailing-campaigns', { failOnStatusCode: false })
    cy.wait('@EmailingCampaignsPageQuery')

    cy.interceptGraphQLOperation({ operationName: 'CreateEmailingCampaignMutation' })
    cy.interceptGraphQLOperation({ operationName: 'EmailingCampaignFormWrapperQuery' })
    cy.get('[data-cy="create-emailing-campaign-button"]').filter(':visible').should('exist').and('be.visible').click()
    // GraphQL answers 200 even on failure, so assert on the payload rather than the HTTP status.
    cy.wait('@CreateEmailingCampaignMutation').its('response.body.data.createEmailingCampaign.error').should('eq', null)
    cy.wait('@EmailingCampaignFormWrapperQuery')
    cy.location('pathname').should('eq', '/admin-next/emailing-campaign')

    cy.get('#name').should('be.visible').clear().type(name, { delay: 0 })
    selectOption('#senderEmail .cap-select__control', 'dev@cap-collectif.com')
    selectOption('.cap-select__control:has(input#recipient)', 'liste Solidarité COVID-19')

    cy.interceptGraphQLOperation({ operationName: 'UpdateEmailingCampaignMutation' })
    cy.get('[data-cy="save-emailing-campaign"]').should('exist').and('be.visible').click()
    cy.wait('@UpdateEmailingCampaignMutation').its('response.body.data.updateEmailingCampaign.error').should('eq', null)
    cy.contains('label.draft.saved').should('be.visible')

    cy.interceptGraphQLOperation({ operationName: 'EmailingCampaignsPageQuery' })
    cy.visit('/admin-next/emailing-campaigns', { failOnStatusCode: false })
    cy.wait('@EmailingCampaignsPageQuery')
    cy.interceptGraphQLOperation({ operationName: 'EmailingCampaignListPaginationQuery' })
    cy.get('#search-emailing-campaign').should('be.visible').type(name, { delay: 0 })
    cy.wait('@EmailingCampaignListPaginationQuery')
    cy.contains(name).should('be.visible')
  })
})
