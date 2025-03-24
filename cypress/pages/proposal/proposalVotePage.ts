export default new (class ProposalVotePage {
  get cy() {
    return cy
  }

  getTotalVotesTab() {
    return this.cy.get('#proposal-page-tabs-tab-votes')
  }

  getTotalVotesCounter() {
    return this.cy.get('#proposal-page-tabs-tab-votes .tip')
  }

  getVoteButton() {
    return this.cy.get('#proposal-vote-btn')
  }

  getConfirmVoteModalButton() {
    return this.cy.get('#confirm-proposal-vote')
  }

  getVoterCards() {
    return this.cy.get('.proposal__vote')
  }

  visitCollectStepWithVoteRankingLimit() {
    cy.interceptGraphQLOperation({ operationName: 'ProposalStepPageQuery' })
    cy.visit('project/bp-avec-vote-classement/collect/collecte-avec-vote-classement-limite')
    return cy.wait('@ProposalStepPageQuery')
  }

  // #region - list of the viewer's votes page
  getStepWithLimiSection() {
    return this.cy.get('#vote-table-step-selection-avec-vote-classement-limite')
  }

  goToViewerVotesPage() {
    this.cy.interceptGraphQLOperation({ operationName: 'ProposalsUserVotesPageAppQuery' })
    this.cy.get('a.widget__button').contains('project.votes.title').click()
    return this.cy.wait('@ProposalsUserVotesPageAppQuery', { timeout: 10000 })
  }

  getConfirmDeleteVoteButton() {
    return this.cy.get('button').contains('btn-delete')
  }

  saveVoteModifications() {
    this.cy.interceptGraphQLOperation({ operationName: 'UpdateProposalVotesMutation' })
    this.getStepWithLimiSection().find('#confirm-update-votes').click()
    this.cy.wait('@UpdateProposalVotesMutation', { timeout: 10000 })
  }
  // #endregion
})()
