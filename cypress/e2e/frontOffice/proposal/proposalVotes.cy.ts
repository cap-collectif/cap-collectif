import { Base } from '~e2e-pages/index'
import proposalVote from '~e2e-pages/proposal/proposalVote'

context('Votes from selection step page', () => {
  beforeEach(() => {
    cy.task('db:restore')
  })

  it('should allow logged in user to vote and unvote for a proposal in selection step', () => {
    cy.directLoginAs('user')

    proposalVote.visitSelection({
      projectSlug: 'budget-participatif-rennes',
      stepSlug: 'selection',
      operationName: 'ProposalListViewRefetchQuery',
    })

    // eslint-disable-next-line jest/valid-expect-in-promise
    cy.get('#proposal-UHJvcG9zYWw6cHJvcG9zYWwy').then(intercept => {
      cy.wrap(intercept).find('.card__counters__value').contains('2')
      cy.wrap(intercept).find('.proposal__button__vote').click({ force: true })
      cy.get('.toasts-container--top div').should('contain', 'vote.add_success')
      cy.wrap(intercept).find('.card__counters__value').contains('3')
      cy.wrap(intercept).find('.proposal__button__vote').click({ force: true })
      cy.wrap(intercept).find('.card__counters__value').contains('2').should('exist').and('be.visible')
    })
  })

  it('should disable vote button when user has not enough credits in budget vote step', () => {
    cy.directLoginAs('admin')

    proposalVote.visitSelection({
      projectSlug: 'depot-avec-selection-vote-budget',
      stepSlug: 'selection-avec-vote-selon-le-budget',
      operationName: 'ProposalListViewRefetchQuery',
    })
    cy.get('#proposal-UHJvcG9zYWw6cHJvcG9zYWw4').find('.proposal__button__vote.disabled').should('exist')
  })

  it('should disable vote button when user has reached limit in selection step', () => {
    cy.directLoginAs('user')

    proposalVote.visitSelection({
      projectSlug: 'budget-avec-vote-limite',
      stepSlug: 'selection-avec-vote-budget-limite',
      operationName: 'ProposalListViewRefetchQuery',
    })

    cy.get('.proposal__button__vote').contains('voted')
    cy.get('.proposal__button__vote.disabled').should('exist')
  })
})

context('Votes from proposal page', () => {
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
  beforeEach(() => {
    cy.task('db:restore')
  })

  it('should allow user to see and remove votes on project', () => {
    cy.directLoginAs('admin')

    proposalVote.visitSelection({
      projectSlug: 'budget-participatif-rennes',
      stepSlug: 'selection',
      operationName: 'ProposalListViewRefetchQuery',
    })

    cy.get('#proposal-UHJvcG9zYWw6cHJvcG9zYWwz').find('.card__counters__value').contains('47')
    cy.get('#proposal-UHJvcG9zYWw6cHJvcG9zYWwz').find('.proposal__button__vote').click({ force: true })
    cy.get('#proposal-UHJvcG9zYWw6cHJvcG9zYWwz').find('.card__counters__value').contains('46')
  })

  /* cypress cannot test this behaviour with react-beautiful-dnd because it doesn't use browser drag and drop behaviour */
  it.skip('should allow user to reorder votes for a project', () => {
    cy.directLoginAs('user')
    Base.visit({ path: '/projects/bp-avec-vote-classement/votes', operationName: 'NavBarMenuQuery' })

    /* This will pass but html would not change! */
    cy.get('.list__item')
      .last()
      .trigger('mousedown', { which: 1 })
      .trigger('mousemove', { clientY: -200 })
      .trigger('mouseup', { force: true })

    cy.get('#vote-table-step-collecte-avec-vote-classement-limite').find('#confirm-update-votes').click({ force: true })
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
