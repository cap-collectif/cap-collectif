export default new (class AdminProjectsListPage {
  get cy() {
    return cy
  }

  get path() {
    return '/admin-next/projects'
  }

  visit() {
    return this.cy.visit(this.path)
  }

  checkProjectExistence(projectName: string) {
    this.cy.contains(projectName).should('exist')
  }
})()
