import { ProposalVotePage } from '~e2e-pages/index'

context('Proposal Vote Page', () => {
  beforeEach(() => {
    cy.task('db:restore')
  })
  describe('Project Vote Page FO', () => {
    it('Logged in as user who does not full fill requirements and want to vote', () => {
      cy.directLoginAs('pierre')
      cy.interceptGraphQLOperation({ operationName: 'AddProposalVoteMutation' })
      cy.interceptGraphQLOperation({ operationName: 'ProposalListViewRefetchQuery' })
      cy.interceptGraphQLOperation({ operationName: 'UpdateProfilePersonalDataMutation' })
      cy.interceptGraphQLOperation({ operationName: 'UpdateRequirementMutation' })

      ProposalVotePage.visitCollectStepWithVoteRankingLimit()
      cy.wait('@ProposalListViewRefetchQuery')
      cy.get('#proposal-vote-btn-UHJvcG9zYWw6cHJvcG9zYWwxMzg\\=').click({ force: true })
      cy.get('#proposal-vote-modal').should('exist')

      cy.contains('.cap-button', 'global.continue').should('be.disabled')

      cy.wait(1000)
      cy.get('[name="PhoneRequirement\\.phoneNumber"]').type('0611111111')

      cy.get('.cap-checkbox__input').click({ force: true, multiple: true })
      cy.get('.cap-date-input').focus().type('2024-04-24')
      cy.contains('.cap-button', 'global.continue').click({ force: true })
      cy.wait('@UpdateRequirementMutation')
      cy.wait('@UpdateProfilePersonalDataMutation')
      cy.wait(1000)
      cy.get('#confirm-proposal-vote').click({ force: true })
      cy.wait('@AddProposalVoteMutation')
      cy.contains('vote-for-x-proposals {"num":2}')
    })

    it('Logged in user wants to vote and unvote for a proposal', () => {
      cy.directLoginAs('user')

      cy.interceptGraphQLOperation({ operationName: 'ProposalPageQuery' })
      cy.interceptGraphQLOperation({ operationName: 'RemoveProposalVoteMutation' })
      cy.interceptGraphQLOperation({ operationName: 'AddProposalVoteMutation' })
      cy.visit('project/budget-participatif-rennes/collect/collecte-des-propositions/proposals/renovation-du-gymnase')
      cy.wait('@ProposalPageQuery')

      ProposalVotePage.getTotalVotesCounter().should('have.text', 2)
      ProposalVotePage.getVoteButton().click({ force: true })
      ProposalVotePage.getConfirmVoteModalButton().click({ force: true })
      cy.wait('@AddProposalVoteMutation')
      cy.contains('vote.add_success')
      ProposalVotePage.getTotalVotesCounter().should('have.text', 3)

      ProposalVotePage.getVoteButton().click({ force: true })
      cy.wait('@RemoveProposalVoteMutation')
      cy.contains('vote.delete_success')
      ProposalVotePage.getTotalVotesCounter().should('have.text', 2)

      ProposalVotePage.getTotalVotesTab().click({ force: true })
      ProposalVotePage.getVoterCards().should('have.length', 2)
    })

    it('Logged in user wants to delete a vote', () => {
      cy.directLoginAs('user')

      cy.interceptGraphQLOperation({ operationName: 'ProposalsUserVotesPageAppQuery' })
      ProposalVotePage.visitCollectStepWithVoteRankingLimit()

      ProposalVotePage.goToViewerVotesPage()

      ProposalVotePage.getStepWithLimiSection().should('contain', 'Proposition 3')
      ProposalVotePage.getStepWithLimiSection().find('button').first().click()
      cy.get('span').contains('are-you-sure-you-want-to-delete-this-vote').should('exist')
      ProposalVotePage.getConfirmDeleteVoteButton().click()
      ProposalVotePage.saveVoteModifications()
      cy.reload()
      cy.wait('@ProposalsUserVotesPageAppQuery')
      ProposalVotePage.getStepWithLimiSection().should('exist').and('not.contain', 'Proposition 3')
    })

    it('Logged in user wants to vote for a proposal anonymously', () => {
      cy.directLoginAs('user')

      cy.interceptGraphQLOperation({ operationName: 'ProposalPageQuery' })
      cy.interceptGraphQLOperation({ operationName: 'RemoveProposalVoteMutation' })
      cy.interceptGraphQLOperation({ operationName: 'AddProposalVoteMutation' })
      cy.visit('project/budget-participatif-rennes/collect/collecte-des-propositions/proposals/renovation-du-gymnase')
      cy.wait('@ProposalPageQuery')

      ProposalVotePage.getTotalVotesCounter().should('have.text', 2)
      ProposalVotePage.getVoteButton().click({ force: true })

      cy.get('.circle-toggler').click({ force: true, multiple: true })

      ProposalVotePage.getConfirmVoteModalButton().click({ force: true })
      cy.wait('@AddProposalVoteMutation')
      cy.contains('vote.add_success')
      ProposalVotePage.getTotalVotesCounter().should('have.text', 3)

      cy.directLoginAs('user_not_confirmed')
      cy.visit('project/budget-participatif-rennes/collect/collecte-des-propositions/proposals/renovation-du-gymnase')
      cy.wait('@ProposalPageQuery')

      ProposalVotePage.getTotalVotesCounter().should('have.text', 3)
      ProposalVotePage.getTotalVotesTab().click({ force: true })
      ProposalVotePage.getVoterCards().should('have.length', 3)
    })

    it('Proposal should stay voted after user refresh the page', () => {
      cy.task('disable:feature', 'new_vote_step')
      cy.directLoginAs('user')
      cy.interceptGraphQLOperation({ operationName: 'ProposalStepPageQuery' })
      cy.interceptGraphQLOperation({ operationName: 'AddProposalVoteMutation' })
      cy.visit('project/budget-participatif-rennes/collect/depot-avec-vote')
      cy.wait('@ProposalStepPageQuery')
      cy.contains('global.vote.for').first().click()
      ProposalVotePage.getConfirmVoteModalButton().click({ force: true })
      cy.wait('@AddProposalVoteMutation')
      cy.contains('vote.add_success')
      cy.reload()
      cy.wait('@ProposalStepPageQuery')
      cy.contains('voted')
    })
  })
})
