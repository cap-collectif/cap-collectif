import { toGlobalId } from '~e2e/helper'

type UserAuthenticationState = 'LOGGED_IN' | 'ANONYMOUS'

export default new (class ProposalVoteListPage {
  get cy() {
    return cy
  }

  visitCollectStepWithSmsVoteEnabled() {
    this.cy.interceptGraphQLOperation({ operationName: 'ProposalStepPageQuery' })
    this.cy.interceptGraphQLOperation({ operationName: 'ProposalListViewRefetchQuery' })
    this.cy.visit('project/budget-participatif-idf-3/collect/collecte-vote-par-sms')
    this.cy.wait('@ProposalStepPageQuery', { timeout: 15000 })
    this.cy.wait('@ProposalListViewRefetchQuery', { timeout: 15000 })
  }

  getProposalVoteButton(proposalId: string) {
    const id = toGlobalId('Proposal', proposalId)
    const escapedId = id.replaceAll('=', '\\=')
    return this.cy.get(`#proposal-vote-btn-${escapedId}`)
  }

  getProposalCounter(proposalId: string) {
    const id = toGlobalId('Proposal', proposalId)
    const escapedId = id.replaceAll('=', '\\=')
    return this.cy.get(
      `#proposal-${escapedId} > .Counters-havABM > .card__counters__item--votes > .card__counters__value`,
    )
  }

  getBugdetSpent() {
    return this.cy.get('.budget > :nth-child(1) > .ProposalVoteBasketWidget__InfoContainer-cjKaTk > :nth-child(2)')
  }

  getVotesPointsCounter(proposalId: string) {
    const id = toGlobalId('Proposal', proposalId)
    const escapedId = id.replaceAll('=', '\\=')
    return this.cy.get(`#proposal-${escapedId} > .Counters-havABM > :nth-child(3) > .card__counters__value`)
  }

  getProjectHeaderVoteCounter() {
    return this.cy.get('#votes-counter-pill')
  }

  getProjectContributorsCounter() {
    return this.cy.get('#contributors-count')
  }

  validateVoteMin(proposalId: string, userAuthenticationState: UserAuthenticationState, hasVotesRanking = false) {
    this.addVoteMutation(userAuthenticationState).intercept()
    if (hasVotesRanking) {
      this.updateVotesMutation(userAuthenticationState).intercept()
    }
    this.getProposalVoteButton(proposalId).click({ force: true })
    cy.contains('proposal.validate.votes')
    cy.get('#confirm-proposal-vote').click({ force: true })
    this.addVoteMutation(userAuthenticationState).wait()
    if (hasVotesRanking) {
      this.updateVotesMutation(userAuthenticationState).wait()
    }
  }

  validateSimpleVote(proposalId: string, userAuthenticationState: UserAuthenticationState, hasVotesRanking = false) {
    this.addVoteMutation(userAuthenticationState).intercept()
    if (hasVotesRanking) {
      this.updateVotesMutation(userAuthenticationState).intercept()
    }
    this.getProposalVoteButton(proposalId).click({ force: true })
    this.addVoteMutation(userAuthenticationState).wait()
    if (hasVotesRanking) {
      this.updateVotesMutation(userAuthenticationState).wait()
    }
  }

  deleteVote(proposalId: string, userAuthenticationState: UserAuthenticationState) {
    this.removeVoteMutation(userAuthenticationState).intercept()
    this.getProposalVoteButton(proposalId).click({ force: true })
    this.removeVoteMutation(userAuthenticationState).wait()
  }

  addVoteMutation(type: UserAuthenticationState) {
    const operationNameMap: Record<UserAuthenticationState, string> = {
      LOGGED_IN: 'AddProposalVoteMutation',
      ANONYMOUS: 'AddProposalSmsVoteMutation',
    }

    const operationName = operationNameMap[type]

    return {
      intercept: () => {
        cy.interceptGraphQLOperation({ operationName })
      },
      wait: () => {
        cy.wait(`@${operationName}`)
      },
    }
  }

  updateVotesMutation(type: UserAuthenticationState) {
    const operationNameMap: Record<UserAuthenticationState, string> = {
      LOGGED_IN: 'UpdateProposalVotesMutation',
      ANONYMOUS: 'UpdateAnonymousProposalVotesMutation',
    }

    const operationName = operationNameMap[type]

    return {
      intercept: () => {
        cy.interceptGraphQLOperation({ operationName })
      },
      wait: () => {
        cy.wait(`@${operationName}`)
      },
    }
  }

  removeVoteMutation(type: UserAuthenticationState) {
    const operationNameMap: Record<UserAuthenticationState, string> = {
      LOGGED_IN: 'RemoveProposalVoteMutation',
      ANONYMOUS: 'RemoveProposalSmsVoteMutation',
    }

    const operationName = operationNameMap[type]

    return {
      intercept: () => {
        cy.interceptGraphQLOperation({ operationName })
      },
      wait: () => {
        cy.wait(`@${operationName}`)
      },
    }
  }

  getVoteWidgetCounter() {
    return cy.get('#vote-counter')
  }
})()
