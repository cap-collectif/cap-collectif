import { ProposalStepPage } from '~e2e-pages/index'
import { setupFeatureFlags } from '../../../support/setupFeatureFlags'

/**
 * @cypress-status reference
 * @cypress-reason Canonical example for authenticated visibility and filter tests synchronized with GraphQL queries.
 */
context('Proposal Step Page', () => {
  setupFeatureFlags({ new_vote_step: false })

  before(() => {
    cy.task('db:restore')
  })

  describe('Project Step Page FO', () => {
    it('should not see votes', () => {
      cy.directLoginAs('user')
      ProposalStepPage.visitSelectionStepWithOpenedVoteButNotDisplayed()
      cy.get('div.card__counters.small').should('not.contain', 'vote.count_no_nb {"count":0}')
    })
    it('should see votes', () => {
      cy.directLoginAs('user')
      ProposalStepPage.visitSelectionStepWithOpenedVoteAndDisplayed()
      cy.get('div.card__counters.small').should('contain', 'vote.count_no_nb')
    })
  })
  describe('filters', () => {
    it('should filter archived projects', () => {
      ProposalStepPage.visit({
        project: 'bp-avec-archivage-des-propositions',
        stepType: 'collect',
        step: 'collecte-des-propositions-avec-archivage',
      })

      // filter archived
      cy.interceptGraphQLOperation({ operationName: 'ProposalStepPageQuery' })
      ProposalStepPage.getFilterStateButton().should('exist').and('be.visible').click()
      cy.contains('global-archived').should('exist').and('be.visible').click()
      cy.wait('@ProposalStepPageQuery')
      ProposalStepPage.getProposalsCards().should('have.length', 1)

      // filter non archived
      cy.interceptGraphQLOperation({ operationName: 'ProposalStepPageQuery' })
      ProposalStepPage.getFilterStateButton().should('exist').and('be.visible').click()
      cy.contains('global.published').should('exist').and('be.visible').click()
      cy.wait('@ProposalStepPageQuery')
      ProposalStepPage.getProposalsCards().should('have.length', 1)

      // filter all
      cy.interceptGraphQLOperation({ operationName: 'ProposalStepPageQuery' })
      ProposalStepPage.getFilterStateButton().should('exist').and('be.visible').click()
      cy.contains('global.select_state').should('exist').and('be.visible').click()
      cy.wait('@ProposalStepPageQuery')
      ProposalStepPage.getProposalsCards().should('have.length', 2)
    })
  })
})
