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
    this.cy.interceptGraphQLOperation({ operationName: 'ProposalStepPageQuery' })
    this.cy.interceptGraphQLOperation({ operationName: 'ProjectHeaderAppQuery' })
    this.cy.visit(`/project/${project}/${stepType}/${step}`)
    this.cy.wait('@ProposalStepPageQuery')
    return this.cy.wait('@ProjectHeaderAppQuery')
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

  visitProposalStepWithPrivateProposal() {
    return this.visit({
      project: 'budget-participatif-dorganisation',
      step: 'collecte-des-propositions-privee',
      stepType: 'collect',
    })
  }

  getFilterStateButton() {
    return cy.get('#proposal-filter-state-button')
  }

  getProposalsCards() {
    return cy.get('.media-list.proposal-preview-list.opinion__list').find('li')
  }
})()
