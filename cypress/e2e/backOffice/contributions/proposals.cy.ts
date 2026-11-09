import { setupFeatureFlags } from '../../../support/setupFeatureFlags'

/**
 * @cypress-status compliant
 * @cypress-reason Covers the Admin Next proposal list behind the Sonata migration feature flag.
 */
describe('Proposals back office', () => {
  setupFeatureFlags({ unstable__sonata_migration_to_admin_next: true })

  before(() => {
    cy.task('db:restore')
  })

  const visitProposalsPage = () => {
    cy.visit('/admin-next/proposals', { failOnStatusCode: false })
  }

  it('redirects a non-ROLE_ADMIN account away from the proposals page', () => {
    cy.directLoginAs('project_owner')
    visitProposalsPage()
    cy.url().should('contain', '/admin-next/403')
    cy.contains('unauthorized-access').should('be.visible')
  })

  it('searches proposals by title', () => {
    cy.directLoginAs('admin')
    cy.interceptGraphQLOperation({ operationName: 'proposals_Query' })
    visitProposalsPage()
    cy.wait('@proposals_Query')

    cy.interceptGraphQLOperation({ operationName: 'ProposalListPaginationQuery' })
    cy.get('input[aria-label="admin.proposals.search"]').should('exist').and('be.visible').type('emailing 2')
    cy.wait('@ProposalListPaginationQuery')

    cy.get('tbody tr').should('have.length', 2)
    cy.contains('tbody tr', 'Proposition emailing 2 (vote au dépôt)').within(() => {
      cy.contains('a', 'Projet pour campagne (vote au dépôt)')
        .should('have.attr', 'href')
        .and('contain', '/admin-next/project/')
    })
  })

  it('merges two proposals into a new one', () => {
    const title = `Cypress merged proposal ${Date.now()}`

    cy.directLoginAs('admin')
    cy.interceptGraphQLOperation({ operationName: 'proposals_Query' })
    visitProposalsPage()
    cy.wait('@proposals_Query')

    // The select loads its default options as soon as the modal opens
    cy.interceptGraphQLOperation({ operationName: 'ProposalFusionModalProjectsQuery' })
    cy.contains('button', 'admin.proposals.merge').should('exist').and('be.visible').click()
    cy.wait('@ProposalFusionModalProjectsQuery')
    cy.get('#project').should('exist').and('be.visible').click()
    // Selecting a project mounts the proposals select, which loads its default options
    cy.interceptGraphQLOperation({ operationName: 'ProposalFusionModalProposalsQuery' })
    cy.selectDSSelectFirstOption(true)
    cy.wait('@ProposalFusionModalProposalsQuery')

    cy.get('#fromProposals').should('exist').and('be.visible').click()
    cy.selectDSSelectFirstOption(true)
    cy.get('#fromProposals').click()
    cy.selectDSSelectFirstOption(true)
    cy.get('#title').should('exist').and('be.visible').type(title)

    cy.interceptGraphQLOperation({ operationName: 'CreateProposalFusionMutation' })
    cy.contains('button', 'create-a-new-proposal').should('exist').and('be.visible').click()
    cy.wait('@CreateProposalFusionMutation')
      .its('response.body.data.createProposalFusion.proposal')
      .should('not.be.null')
    cy.url().should('match', /\/admin\/capco\/app\/proposal\/[^/]+\/edit/)
  })
})
