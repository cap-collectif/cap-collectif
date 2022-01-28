import { ProposalPage } from '~e2e-pages/index'

describe('Proposal Page', () => {
  describe('Project Page FO', () => {
    beforeEach(() => {
      cy.task('db:restore')
      cy.directLoginAs('user')
    })
    it('should see votes', () => {
      ProposalPage.visitSelectionStepWithOpenedVoteAndDisplayed()
      cy.get('#ProposalPageVoteThreshold').should('contain', 'proposal.vote.threshold.title')
      cy.get('#proposal-page-tabs-tab-votes').should('contain', 'global.vote')
    })
    it('should not see votes', () => {
      ProposalPage.visitSelectionStepWithOpenedVoteButNotDisplayed()
      cy.get('body').should('not.contain', '#ProposalPageVoteThreshold')
      cy.get('body').should('not.contain', '#proposal-page-tabs-tab-votes')
    })
  })
})
