export default new (class EmailingCampaignPage {
  get cy() {
    return cy
  }

  path() {
    return `admin/mailingCampaign/list`
  }

  visit() {
    return this.cy.visit(this.path())
  }

  createNewEmail() {
    this.createButton.click()
  }

  closeModal() {
    this.closeButton.click()
  }

  get createButton() {
    return this.cy.contains('create-mail')
  }

  get closeButton() {
    return this.cy.get('[aria-label="global.close"]')
  }

})()
