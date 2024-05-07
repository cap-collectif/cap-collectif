import { NewProposalStepPage } from '~e2e-pages/index'

describe('Proposal Vote Step Page', () => {
  beforeEach(() => {
    cy.task('db:restore')
    cy.task('enable:feature', 'new_vote_step')
  })
  it('should not see the page if the new vote step feature toggle is disabled', () => {
    cy.task('disable:feature', 'new_vote_step')
    NewProposalStepPage.visitVoteStep(false)
    NewProposalStepPage.pageId.should('not.exist')
  })
  it('should be able to vote on an open vote step when logged', () => {
    cy.directLoginAs('user')
    NewProposalStepPage.visitVoteStep()
    NewProposalStepPage.pageId.should('exist')
    cy.interceptGraphQLOperation({ operationName: 'AddProposalVoteMutation' })
    NewProposalStepPage.proposalsList.children().children().should('have.length', '3')
    NewProposalStepPage.proposalVoteButton.click()
    cy.wait('@AddProposalVoteMutation')
    cy.contains('vote.add_success')
    NewProposalStepPage.votesViewButton.click()
    cy.wait(5000)
    NewProposalStepPage.votesList.children().children().should('have.length', '2')
  })
  it('should not be able to vote on an open vote step when not connected', () => {
    NewProposalStepPage.visitVoteStep()
    NewProposalStepPage.pageId.should('exist')
    NewProposalStepPage.proposalVoteButton.click()
    cy.get('#login-popover').should('exist')
  })
  it('should open the phone verification modal when sms vote is activated and user is not connected', () => {
    cy.task('enable:feature', 'twilio')
    cy.task('enable:feature', 'proposal_sms_vote')
    NewProposalStepPage.visitSMSVoteStep()
    NewProposalStepPage.pageSMSId.should('exist')
    NewProposalStepPage.proposalSMSVoteButton.click()
    cy.contains('proposal.requirement.header.title')
  })
})
