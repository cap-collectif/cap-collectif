import { setupFeatureFlags } from '../../../support/setupFeatureFlags'

/**
 * @cypress-status compliant
 * @cypress-reason Display check of a rarely used back-office page, following the appearance settings reference.
 */
describe('Reporting back office', () => {
  setupFeatureFlags({ unstable__sonata_migration_to_admin_next: true })

  before(() => {
    cy.task('db:restore')
  })

  it('displays the reportings and opens the details of one of them', () => {
    cy.directLoginAs('admin')
    cy.interceptGraphQLOperation({ operationName: 'reporting_Query' })
    cy.interceptGraphQLOperation({ operationName: 'ReportingModalQuery' })
    cy.visit('/admin-next/reporting', { failOnStatusCode: false })
    cy.wait('@reporting_Query').its('response.statusCode').should('not.eq', 500)

    cy.get('tbody tr').should('have.length.greaterThan', 0)
    // The contribution title opens the details modal
    cy.get('tbody tr').first().find('td').first().find('button').should('be.visible').click()
    cy.wait('@ReportingModalQuery').its('response.statusCode').should('not.eq', 500)
    cy.get('[role="dialog"]').within(() => {
      cy.contains('admin.fields.reporting.body').should('be.visible')
      cy.contains('button', 'admin.action.reporting.archive.label').should('be.visible')
    })
  })
})
