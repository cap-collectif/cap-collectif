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
})()
