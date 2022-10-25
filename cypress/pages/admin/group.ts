export default new (class AdminGroupPage {
  get cy() {
    return cy
  }

  get path() {
    return '/admin/capco/app/group/list'
  }

  visit() {
    return this.cy.visit(this.path)
  }

  clickButtonAddGroup() {
    this.buttonAddGroup.click()
  }

  get buttonAddGroup() {
    return this.cy.get('#add-group')
  }
})()
