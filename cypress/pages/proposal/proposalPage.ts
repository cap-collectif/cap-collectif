type VisitOptions = {
  project: string
  step: string
  stepType: string
  proposal: string
}

export default new (class ProposalPage {
  get cy() {
    return cy
  }

  visit({ project, step, stepType, proposal }: VisitOptions) {
    this.cy.interceptGraphQLOperation({ operationName: 'ProposalPageQuery' })
    this.cy.interceptGraphQLOperation({ operationName: 'ProposalVotesByStepQuery' })
    this.cy.visit(`/project/${project}/${stepType}/${step}/proposals/${proposal}`)
    this.cy.wait('@ProposalPageQuery')
    this.cy.wait('@ProposalVotesByStepQuery')
  }

  visitWithoutVotes({ project, step, stepType, proposal }: VisitOptions) {
    this.cy.interceptGraphQLOperation({ operationName: 'ProposalPageQuery' })
    this.cy.interceptGraphQLOperation({ operationName: 'ProposalVotesByStepQuery' })
    this.cy.visit(`/project/${project}/${stepType}/${step}/proposals/${proposal}`)
    this.cy.wait('@ProposalPageQuery')
  }

  visitSelectionStepWithOpenedVoteButNotDisplayed() {
    return this.visitWithoutVotes({
      project: 'budget-participatif-idf-3',
      step: 'collecte-des-projets-idf-brp-3',
      stepType: 'collect',
      proposal: 'proposition-pour-tester-le-doublon',
    })
  }

  visitSelectionStepWithOpenedVoteAndDisplayed() {
    return this.visit({
      project: 'budget-participatif-idf-3',
      step: 'collecte-des-projets-idf-brp-3',
      stepType: 'collect',
      proposal: 'proposition-avec-des-reseaux-sociaux',
    })
  }

  visitProposalPage() {
    return this.visit({
      project: 'budget-participatif-rennes',
      step: 'collecte-des-propositions',
      stepType: 'collect',
      proposal: 'renovation-du-gymnase',
    })
  }

  visitPrivateProposalPage() {
    return this.visit({
      project: 'budget-participatif-dorganisation',
      step: 'collecte-des-propositions-privee',
      stepType: 'collect',
      proposal: 'proposition-de-valerie',
    })
  }

  visitContactableProposalPage() {
    return this.visitWithoutVotes({
      project: 'solidarite-covid-19',
      step: 'collecte-de-projets',
      stepType: 'collect',
      proposal: 'proposal-assigned-120',
    })
  }

  visitLegacyStepPage({
    project,
    step,
    kind = 'collect',
  }: {
    project: string
    step: string
    kind?: 'collect' | 'selection'
  }) {
    this.cy.interceptGraphQLOperation({ operationName: 'ProposalStepPageQuery' })
    this.cy.interceptGraphQLOperation({ operationName: 'ProposalListViewRefetchQuery' })
    this.cy.visit(`/project/${project}/${kind}/${step}`)
    this.cy.wait('@ProposalStepPageQuery')
    this.cy.wait('@ProposalListViewRefetchQuery')
  }

  visitCollectStepPage({
    project,
    step,
    waitForVoteStep = true,
  }: {
    project: string
    step: string
    waitForVoteStep?: boolean
  }) {
    if (waitForVoteStep) {
      this.cy.interceptGraphQLOperation({ operationName: 'VoteStepQuery' })
      this.cy.interceptGraphQLOperation({ operationName: 'useVoteStepFilters_Query' })
    }
    this.cy.visit(`/project/${project}/collect/${step}`, { timeout: 120000 })
    if (waitForVoteStep) {
      this.cy.wait('@VoteStepQuery', { timeout: 15000 })
      this.cy.wait('@useVoteStepFilters_Query', { timeout: 15000 })
    }
  }

  visitSelectionStepPage({ project, step }: { project: string; step: string }) {
    this.cy.interceptGraphQLOperation({ operationName: 'VoteStepQuery' })
    this.cy.interceptGraphQLOperation({ operationName: 'useVoteStepFilters_Query' })
    this.cy.visit(`/project/${project}/selection/${step}`)
    this.cy.wait('@VoteStepQuery', { timeout: 15000 })
    this.cy.wait('@useVoteStepFilters_Query', { timeout: 15000 })
  }
})()
