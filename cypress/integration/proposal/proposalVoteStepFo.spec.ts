import { NewProposalStepPage } from '~e2e-pages/index'

describe('Proposal Vote Step Page', () => {
  beforeEach(() => {
    cy.task('db:restore')
    cy.task('enable:feature', 'new_vote_step')
  })
  it('should not see the page if the new vote step feature toggle is disabled', () => {
    cy.task('disable:feature', 'new_vote_step')
    NewProposalStepPage.visitVoteStepWithNewDesignDisabled()
    cy.get('#step-header').should('not.exist')
  })
  it('should be able to vote on an open vote step when logged', () => {
    cy.directLoginAs('user')
    NewProposalStepPage.visitVoteStepWithNewDesignEnabled()
    cy.get('#step-header').should('exist')
    cy.getByDataCy('project-vote-count').should('contain', '6')
    NewProposalStepPage.proposalsList.children().children().should('have.length', '51')
    NewProposalStepPage.proposalVoteButton.click()
    cy.wait(5000)
    cy.getByDataCy('project-vote-count').should('contain', '7')
    NewProposalStepPage.proposalsList.children().children().should('have.length', '50')
    NewProposalStepPage.votesViewButton.click()
    cy.wait(5000)
    NewProposalStepPage.proposalVoteButton.should('exist')
  })
  it('should not be able to vote on an open vote step when not connected', () => {
    NewProposalStepPage.visitVoteStepWithNewDesignEnabled()
    cy.get('#step-header').should('exist')
    NewProposalStepPage.proposalVoteButton.click()
    cy.get('#login-popover').should('exist')
  })
})
