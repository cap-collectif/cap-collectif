type VisitOptions = {
  project: string
  step: string
  stepType: string
  waitForQuery: boolean
}

export default new (class ProposalStepPage {
  get cy() {
    return cy
  }

  get pageId() {
    this.cy.wait(1000)
    const escapedId = '#vote-step-page-U2VsZWN0aW9uU3RlcDpzZWxlY3Rpb25zdGVwMQ=='.replaceAll('=', '\\=')
    return this.cy.get(escapedId)
  }

  get pageSMSId() {
    this.cy.wait(1000)
    const escapedId = '#vote-step-page-Q29sbGVjdFN0ZXA6Y29sbGVjdHN0ZXBTbXNWb3RlSWRmMw=='.replaceAll('=', '\\=')
    return this.cy.get(escapedId)
  }

  get proposalVoteButton() {
    this.cy.wait(1000)
    return this.cy.get('#proposal-vote-btn-UHJvcG9zYWw6cHJvcG9zYWwy')
  }

  get proposalSMSVoteButton() {
    this.cy.wait(1000)
    return this.cy.get('button[id*="proposal-vote-btn-UHJvcG9zYWw6cHJvcG9zYWxTbXNWb3RlMw"]')
  }

  get votesViewButton() {
    this.cy.wait(1000)
    return this.cy.get('#change-to-votes-view')
  }

  get proposalsList() {
    this.cy.wait(1000)
    return this.cy.get('#proposals-list')
  }

  get votesList() {
    this.cy.wait(1000)
    return this.cy.get('#votes-list')
  }

  visitNewVoteStep({ project, step, stepType, waitForQuery = true }: VisitOptions) {
    if (!waitForQuery) return this.cy.visit(`/project/${project}/${stepType}/${step}?sort=last`)
    this.cy.interceptGraphQLOperation({ operationName: 'ProposalsListQuery' })
    this.cy.visit(`/project/${project}/${stepType}/${step}?sort=last`)
    return cy.wait('@ProposalsListQuery')
  }

  visitVoteStep(waitForQuery = true) {
    return this.visitNewVoteStep({
      project: 'budget-participatif-rennes',
      step: 'selection',
      stepType: 'selection',
      waitForQuery,
    })
  }

  visitSMSVoteStep(waitForQuery = true) {
    return this.visitNewVoteStep({
      project: 'budget-participatif-idf-3',
      step: 'collecte-vote-par-sms',
      stepType: 'collect',
      waitForQuery,
    })
  }
})()
