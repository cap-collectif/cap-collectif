import { toGlobalId } from '~e2e/helper'

export default new (class ProjectHeaderPage {
  get cy() {
    return cy
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

  getProjectContributionsCounter() {
    return this.cy.get('#contributions-count')
  }

})()
