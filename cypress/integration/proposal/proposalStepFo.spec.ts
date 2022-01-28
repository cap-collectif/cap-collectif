import { ProposalStepPage } from '~e2e-pages/index'

describe('Proposal Step Page', () => {
  describe('Project Step Page FO', () => {
    beforeEach(() => {
      cy.task('db:restore')
      cy.directLoginAs('user')
    })
    it('should not see votes', () => {
      ProposalStepPage.visitSelectionStepWithOpenedVoteButNotDisplayed()
      cy.get('div.card__counters.small').should('not.contain', 'vote.count_no_nb {"count":0}')
    })
    it('should see votes', () => {
      ProposalStepPage.visitSelectionStepWithOpenedVoteAndDisplayed()
      cy.get('div.card__counters.small').should('contain', 'vote.count_no_nb {"count":1}')
    })
  })
})
