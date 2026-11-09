import { setupFeatureFlags } from '../../../support/setupFeatureFlags'

/**
 * @cypress-status compliant
 * @cypress-reason Display check of a rarely used back-office page, following the appearance settings reference.
 */
describe('Opinions back office', () => {
  setupFeatureFlags({ unstable__sonata_migration_to_admin_next: true })

  before(() => {
    cy.task('db:restore')
  })

  it('searches the opinions by title and opens the edition of one of them', () => {
    cy.directLoginAs('admin')
    cy.interceptGraphQLOperation({ operationName: 'opinions_Query' })
    cy.interceptGraphQLOperation({ operationName: 'OpinionFormWrapperQuery' })
    cy.visit('/admin-next/opinions', { failOnStatusCode: false })
    cy.wait('@opinions_Query').its('response.statusCode').should('not.eq', 500)
    cy.get('tbody tr').should('have.length.greaterThan', 0)

    // The search refetches the list with the same query
    cy.get('input[aria-label="admin.proposals.search"]').type('Article 1')
    cy.wait('@opinions_Query')
    cy.get('tbody tr').should('have.length', 1)

    cy.get('tbody tr').first().contains('a', 'Article 1').click()
    cy.wait('@OpinionFormWrapperQuery').its('response.statusCode').should('not.eq', 500)
    cy.get('#title').should('have.value', 'Article 1')
  })
})
