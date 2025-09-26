import { ProposalStepPage } from '~e2e-pages/index'

context('Proposal Step Page', () => {
  describe('Project Step Page FO', () => {
    beforeEach(() => {
      cy.task('db:restore')
      cy.task('disable:feature', 'new_vote_step')
    })
    it('should not see votes', () => {
      cy.directLoginAs('user')
      ProposalStepPage.visitSelectionStepWithOpenedVoteButNotDisplayed()
      cy.get('div.card__counters.small').should('not.contain', 'vote.count_no_nb {"count":0}')
    })
    it('should see votes', () => {
      cy.directLoginAs('user')
      ProposalStepPage.visitSelectionStepWithOpenedVoteAndDisplayed()
      cy.get('div.card__counters.small').should('contain', 'vote.count_no_nb {"count":1}')
    })
    it('should see private proposal of the same organization', () => {
      cy.directLoginAs('christophe')
      ProposalStepPage.visitProposalStepWithPrivateProposal()
      cy.contains('Proposition de Valérie')
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
      ProposalStepPage.getFilterStateButton().click()
      cy.contains('global-archived').click()
      cy.interceptGraphQLOperation({ operationName: 'ProposalStepPageQuery' })
      cy.wait('@ProposalStepPageQuery')
      ProposalStepPage.getProposalsCards().should('have.length', 1)

      // filter non archived
      ProposalStepPage.getFilterStateButton().click()
      cy.contains('global.published').click()
      cy.interceptGraphQLOperation({ operationName: 'ProposalStepPageQuery' })
      cy.wait('@ProposalStepPageQuery')
      ProposalStepPage.getProposalsCards().should('have.length', 1)

      // filter all
      ProposalStepPage.getFilterStateButton().click()
      cy.contains('global.select_state').click()
      cy.interceptGraphQLOperation({ operationName: 'ProposalStepPageQuery' })
      cy.wait('@ProposalStepPageQuery')
      ProposalStepPage.getProposalsCards().should('have.length', 2)
    })
  })
})
