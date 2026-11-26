import { Base } from '~e2e-pages/index'
import proposalVote from '~e2e-pages/proposal/proposalVote'
import { toGlobalId } from '~e2e/helper'
import { setupFeatureFlags } from '../../../support/setupFeatureFlags'

const getProposalVoteButton = (proposalId: string) => {
  return cy.getByDataCy(`proposal-vote-button-${toGlobalId('Proposal', proposalId)}`)
}

context('Votes from selection step page', () => {
  setupFeatureFlags({ new_vote_step: true, new_new_vote_step: true })

  beforeEach(() => {
    cy.task('db:restore')
  })

  it('should allow logged in user to vote and unvote for a proposal in selection step', () => {
    cy.directLoginAs('user')

    proposalVote.visitSelection({
      projectSlug: 'budget-participatif-rennes',
      stepSlug: 'selection',
      operationName: 'VoteStepQuery',
    })

    cy.interceptGraphQLOperation({ operationName: 'AddProposalVoteMutation' })
    cy.interceptGraphQLOperation({ operationName: 'RemoveProposalVoteMutation' })
    getProposalVoteButton('proposal2').should('contain', '2').click({ scrollBehavior: 'center' })
    cy.wait('@AddProposalVoteMutation').its('response.body.data.addProposalVote').should('deep.include', {
      errorCode: null,
    })
    getProposalVoteButton('proposal2').should('have.attr', 'aria-label', 'global.delete')
    getProposalVoteButton('proposal2').should('contain', '3').click({ scrollBehavior: 'center' })
    cy.wait('@RemoveProposalVoteMutation').its('response.body.data.removeProposalVote').should('exist')
    getProposalVoteButton('proposal2').should('be.visible').and('contain', '2')
    getProposalVoteButton('proposal2').should('have.attr', 'aria-label', 'global.add')
  })

  it('rejects an additional vote when the remaining budget is too low', () => {
    cy.directLoginAs('admin')

    proposalVote.visitSelection({
      projectSlug: 'depot-avec-selection-vote-budget',
      stepSlug: 'selection-avec-vote-selon-le-budget',
      operationName: 'VoteStepQuery',
    })
    cy.interceptGraphQLOperation({ operationName: 'AddProposalVoteMutation' })
    getProposalVoteButton('proposal8').should('be.enabled').click({ scrollBehavior: 'center' })
    cy.wait('@AddProposalVoteMutation')
      .its('response.body.data.addProposalVote.errorCode')
      .should('eq', 'NOT_ENOUGH_CREDITS')
    cy.contains(/front\.vote\.error\.budget-exceeded|dépasse le budget restant/).should('be.visible')
  })

  it('rejects an additional vote when the user has reached the selection vote limit', () => {
    cy.directLoginAs('user')

    proposalVote.visitSelection({
      projectSlug: 'budget-avec-vote-limite',
      stepSlug: 'selection-avec-vote-budget-limite',
      operationName: 'VoteStepQuery',
    })

    getProposalVoteButton('proposal17').should('have.attr', 'aria-label', 'global.delete')
    cy.interceptGraphQLOperation({ operationName: 'AddProposalVoteMutation' })
    getProposalVoteButton('proposal18').should('be.enabled').click({ scrollBehavior: 'center' })
    cy.wait('@AddProposalVoteMutation')
      .its('response.body.data.addProposalVote.errorCode')
      .should('eq', 'VOTE_LIMIT_REACHED')
    cy.contains(/front\.vote\.error\.limit-reached|nombre maximal de votes/).should('be.visible')
  })
})

context('Votes from proposal page', () => {
  before(() => {
    cy.task('db:restore')
  })

  it('should disable vote button when admin has not enough credits', () => {
    cy.directLoginAs('admin')

    proposalVote.visitCollect({
      projectSlug: 'depot-avec-selection-vote-budget',
      stepSlug: 'collecte-des-propositions-1',
      proposalSlug: 'proposition-pas-chere',
      operationName: 'ProposalVotesByStepQuery',
    })

    cy.get('.proposal__button__vote.disabled').should('exist')
  })

  it('should not show vote button for anonymous user when proposal is not votable yet', () => {
    proposalVote.visitCollect({
      projectSlug: 'budget-participatif-rennes',
      stepSlug: 'collecte-des-propositions',
      proposalSlug: 'proposition-pas-encore-votable',
      operationName: 'ProposalVotesByStepQuery',
    })
    cy.get('.proposal__button__vote').should('not.exist')
  })

  it('should not show vote button for anonymous user when proposal is not votable anymore', () => {
    proposalVote.visitCollect({
      projectSlug: 'budget-participatif-rennes',
      stepSlug: 'collecte-des-propositions',
      proposalSlug: 'proposition-plus-votable',
      operationName: 'ProposalVotesByStepQuery',
    })
    cy.get('#proposal-vote-button').should('not.exist')
  })
})

context('Votes management page', () => {
  setupFeatureFlags({ new_new_vote_step: true })

  beforeEach(() => {
    cy.task('db:restore')
  })

  it('should allow user to see and remove votes on project', () => {
    cy.directLoginAs('admin')

    proposalVote.visitSelection({
      projectSlug: 'budget-participatif-rennes',
      stepSlug: 'selection',
      operationName: 'VoteStepQuery',
    })

    getProposalVoteButton('proposal3').should('contain', '47').click({ force: true })
    getProposalVoteButton('proposal3').should('contain', '46')
  })

  it('should allow user to set a vote as anonymous', () => {
    cy.directLoginAs('user')
    Base.visit({ path: '/projects/bp-avec-vote-classement/votes', operationName: 'NavBarMenuQuery' })

    cy.contains('global.anonymous').should('not.exist')

    cy.get('.list__item label').first().click({ force: true })

    cy.contains('global.anonymous').should('be.visible')

    cy.get('#confirm-update-votes').click({ force: true })

    Base.reload({ operationName: 'NavBarMenuQuery' })

    cy.contains('global.anonymous').should('be.visible')
  })
})
