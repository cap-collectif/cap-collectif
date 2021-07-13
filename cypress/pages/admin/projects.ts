export default new (class AdminProjectsPage {
  get cy() {
    return cy
  }

  get path() {
    return '/admin/capco/app/project/list'
  }

  visit() {
    return this.cy.visit(this.path)
  }
})()
