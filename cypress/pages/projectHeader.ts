import { toGlobalId } from '~e2e/helper'

export default new (class ProjectHeaderPage {
  get cy() {
    return cy
  }

  getVotesPointsCounter(proposalId: string) {
    const id = toGlobalId('Proposal', proposalId)
    const escapedId = id.replaceAll('=', '\\=')

    return this.cy.get('body').then($body => {
      const selector = `[data-cy="proposal-points-counter-${id}"]`

      if ($body.find(selector).length) {
        return this.cy.get(selector)
      }

      this.cy.reload()

      return this.cy.get('body').then($bodyAfterReload => {
        if ($bodyAfterReload.find(selector).length) {
          return this.cy.get(selector)
        }

        return this.cy.get(`#cap-proposal-card-${escapedId}`)
      })
    })
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
