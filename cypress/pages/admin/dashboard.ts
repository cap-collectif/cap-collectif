export default new (class AdminDashboardPage {
  get cy() {
    return cy
  }

  get path() {
    return '/admin/dashboard'
  }

  visit() {
    return this.cy.visit(this.path)
  }

  clickAdminLink() {
    this.navbarUsername.click()
    this.adminLink.click()
  }

  get navbarUsername() {
    return this.cy.get('#navbar-username')
  }

  get adminLink() {
    return this.cy.contains('global.administration')
  }
})()
