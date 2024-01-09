import { toGlobalId } from '~e2e/helper'

type Proposal = 'proposalSmsVote1' | 'proposalSmsVote2' | 'proposalSmsVote3' | 'proposalSmsVote4'

export default new (class ProposalSms {
  get cy() {
    return cy
  }

  visitCollectStepWithSmsVoteEnabled() {
    this.cy.interceptGraphQLOperation({ operationName: 'ProposalStepPageQuery' })
    this.cy.interceptGraphQLOperation({ operationName: 'ProposalListViewRefetchQuery' })
    this.cy.visit('project/budget-participatif-idf-3/collect/collecte-vote-par-sms')
    this.cy.wait('@ProposalStepPageQuery')
    this.cy.wait('@ProposalListViewRefetchQuery')
  }

  getProposalVoteButton(proposal: Proposal) {
    const id = toGlobalId('Proposal', proposal)
    const escapedId = id.replaceAll('=', '\\=')
    return this.cy.get(`#proposal-vote-btn-${escapedId}`)
  }

  clickVerifyNumber() {
    return this.cy.contains('verify.number').click()
  }

  fillPhone(number = '0611111111') {
    return this.cy.get('[name="phone"]').type(number)
  }

  fillCode(code = '123456') {
    return this.cy.get('[name="code"]').first().type(code)
  }

  getProposalSuggestionCards() {
    return this.cy.get('a[class*="ProposalSuggestionCard__Link"]')
  }

  getVoteHeaderMaxVoteCounter() {
    return this.cy.get('#vote-counter')
  }
})()
