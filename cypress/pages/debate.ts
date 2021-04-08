type VisitOptions = {
  project: string
  debate: string
}

export default new (class DebatePage {
  get cy() {
    return cy
  }

  get forButton() {
    this.cy.wait(1000)
    return this.cy.contains('button', 'global.for')
  }

  get againstButton() {
    this.cy.wait(1000)
    return this.cy.contains('button', 'global.against')
  }

  visit({ project, debate }: VisitOptions) {
    this.cy.interceptGraphQLOperation({ operationName: 'DebateStepPageQuery' })
    this.cy.visit(`/project/${project}/debate/${debate}`)
    return this.cy.wait('@DebateStepPageQuery')
  }

  visitCannabisDebate() {
    return this.visit({
      project: 'debat-sur-le-cannabis',
      debate: 'pour-ou-contre-la-legalisation-du-cannabis',
    })
  }
})()
