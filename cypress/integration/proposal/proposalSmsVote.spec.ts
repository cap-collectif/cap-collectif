import { ProposalVoteSms } from '~e2e-pages/index'

describe('Proposal SMS vote', () => {
  beforeEach(() => {
    cy.task('db:restore')
    cy.task('enable:feature', 'twilio')
    cy.task('enable:feature', 'proposal_sms_vote')
    cy.task('enable:feature', 'display_pictures_in_depository_proposals_list')
    cy.clearCookie('AnonymousAuthenticatedWithConfirmedPhone')
  })
  it('should vote then delete correctly', () => {
    cy.interceptGraphQLOperation({ operationName: 'RemoveProposalSmsVoteMutation' })
    cy.interceptGraphQLOperation(
      { operationName: 'SendSmsProposalVoteMutation' },
      {
        statusCode: 200,
        body: {
          data: {
            sendSmsProposalVote: {
              errorCode: null,
            },
          },
        },
      },
    )
    cy.interceptGraphQLOperation(
      { operationName: 'VerifySmsVotePhoneNumberMutation' },
      {
        statusCode: 200,
        body: {
          data: {
            verifySmsVotePhoneNumber: {
              errorCode: null,
              token: 'token',
            },
          },
        },
      },
    )
    ProposalVoteSms.visitCollectStepWithSmsVoteEnabled()
    cy.interceptGraphQLOperation({ operationName: 'AddProposalSmsVoteMutation' })
    ProposalVoteSms.getProposalVoteButton('proposalSmsVote4').click()
    // step 1
    cy.contains('youre-almost-there')
    ProposalVoteSms.fillPhone()
    ProposalVoteSms.clickVerifyNumber()
    cy.wait('@SendSmsProposalVoteMutation')
    // step 2
    cy.contains('number-verification')
    ProposalVoteSms.fillCode()
    cy.wait('@VerifySmsVotePhoneNumberMutation')
    cy.wait('@AddProposalSmsVoteMutation')
    // step 3
    cy.contains('your-vote-has-been-validated')
    cy.contains('dont-stop-here-check-other-proposals')
    ProposalVoteSms.getProposalSuggestionCards().should('have.length', 2)
    cy.contains('global.close').click({ force: true })
    cy.getCookie('AnonymousAuthenticatedWithConfirmedPhone').should('have.property', 'value', 'InRva2VuIg==')

    // check for max vote
    ProposalVoteSms.getVoteHeaderMaxVoteCounter().contains('2')
    ProposalVoteSms.getProposalVoteButton('proposalSmsVote2').should('be.disabled').contains('global.vote.for')
    ProposalVoteSms.getProposalVoteButton('proposalSmsVote3').should('be.disabled').contains('global.vote.for')
    ProposalVoteSms.getProposalVoteButton('proposalSmsVote1').should('not.be.disabled').contains('voted')
    ProposalVoteSms.getProposalVoteButton('proposalSmsVote4').should('not.be.disabled').contains('cancel')

    // delete vote
    ProposalVoteSms.getProposalVoteButton('proposalSmsVote4').click()
    cy.wait('@RemoveProposalSmsVoteMutation')
    ProposalVoteSms.getProposalVoteButton('proposalSmsVote4').should('not.be.disabled').contains('global.vote.for')
    ProposalVoteSms.getProposalVoteButton('proposalSmsVote2').should('not.be.disabled').contains('global.vote.for')
    ProposalVoteSms.getProposalVoteButton('proposalSmsVote3').should('not.be.disabled').contains('global.vote.for')
  })
})
