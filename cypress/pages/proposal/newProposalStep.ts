type VisitOptions = {
  project: string
  step: string
  stepType: string
}

export default new (class ProposalStepPage {
  get cy() {
    return cy
  }

  get proposalVoteButton() {
    this.cy.wait(1000)
    const escapedId = '#proposal-vote-button-UHJvcG9zYWw6cHJvcG9zYWxMb2NhdGlvbjExOQ=='.replaceAll('=', '\\=')
    return this.cy.get(escapedId)
  }

  get votesViewButton() {
    this.cy.wait(1000)
    return this.cy.get('#change-to-votes-view')
  }

  get proposalsList() {
    this.cy.wait(1000)
    return this.cy.get('#proposals-list')
  }

  visitNewVoteStep({ project, step, stepType }: VisitOptions) {
    this.cy.interceptGraphQLOperation({ operationName: 'ProjectStepHeaderQuery' })
    this.cy.interceptGraphQLOperation({ operationName: 'ProposalsListQuery' })
    this.cy.visit(`/project/${project}/${stepType}/${step}?sort=last`)
    cy.wait('@ProjectStepHeaderQuery')
    return cy.wait('@ProposalsListQuery')
  }

  visitVoteStepWithNewDesignEnabled() {
    return this.visitNewVoteStep({
      project: 'budget-participatif-idf-3',
      step: 'vote-des-franciliens',
      stepType: 'vote',
    })
  }

  visitVoteStepWithNewDesignDisabled() {
    return this.cy.visit('/project/budget-participatif-idf-3/vote/vote-des-franciliens')
  }
})()
