type VisitOptions = {
  project: string
  step: string
  stepType: string
}

export default new (class ProposalStepPage {
  get cy() {
    return cy
  }

  visit({ project, step, stepType }: VisitOptions) {
    this.cy.interceptGraphQLOperation({ operationName: 'ProposalVoteBasketWidgetAppQuery' })
    this.cy.interceptGraphQLOperation({ operationName: 'ProposalStepPageQuery' })
    this.cy.interceptGraphQLOperation({ operationName: 'ProjectHeaderAppQuery' })
    this.cy.visit(`/project/${project}/${stepType}/${step}`)
    this.cy.wait('@ProposalStepPageQuery')
    this.cy.wait('@ProjectHeaderAppQuery')
    return this.cy.wait('@ProposalVoteBasketWidgetAppQuery')
  }

  visitSelectionStepWithOpenedVoteButNotDisplayed() {
    return this.visit({
      project: 'budget-participatif-idf-3',
      step: 'vote-des-franciliens',
      stepType: 'selection',
    })
  }

  visitSelectionStepWithOpenedVoteAndDisplayed() {
    return this.visit({
      project: 'budget-participatif-idf-3',
      step: 'le-suivi-des-projets-laureats',
      stepType: 'selection',
    })
  }
})