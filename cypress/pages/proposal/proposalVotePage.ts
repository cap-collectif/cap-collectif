type VisitOptions = {
  project: string
  step: string
  stepType: string
}

export default new (class ProposalVotePage {
  get cy() {
    return cy
  }

  visit({ project, step, stepType }: VisitOptions) {
    this.cy.interceptGraphQLOperation({ operationName: 'ProposalStepPageQuery' })
    this.cy.visit(`/project/${project}/${stepType}/${step}`)
    this.cy.wait('@ProposalStepPageQuery')
  }
})()
