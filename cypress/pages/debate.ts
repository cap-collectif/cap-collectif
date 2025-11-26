type VisitOptions = {
  project: string
  debate: string
}

export default new (class DebatePage {
  get cy() {
    return cy
  }

  get forButton() {
    return this.cy.contains('button', 'global.for', { timeout: 1000 })
  }

  get againstButton() {
    this.cy.wait(1000)
    return this.cy.contains('button', 'global.against', { timeout: 1000 })
  }

  clickOnVoteForButton() {
    return this.forButton.click({ force: true })
  }

  clickOnVoteAgainstButton() {
    return this.againstButton.click({ force: true })
  }

  visit({ project, debate }: VisitOptions) {
    this.cy.interceptGraphQLOperation({ operationName: 'DebateStepPageQuery' })
    this.cy.visit(`/project/${project}/debate/${debate}`)
    return this.cy.wait('@DebateStepPageQuery', { timeout: 10000 })
  }

  visitCannabisDebate() {
    return this.visit({
      project: 'debat-sur-le-cannabis',
      debate: 'pour-ou-contre-la-legalisation-du-cannabis',
    })
  }
})()
