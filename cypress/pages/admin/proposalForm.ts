export default new (class ProposalFormPage {
  get cy() {
    return cy
  }

  path(proposalFormId: string) {
    return `/admin/capco/app/proposalform/${proposalFormId}/edit`
  }

  visit(proposalFormId: string) {
    return this.cy.visit(this.path(proposalFormId))
  }

  get settingsTab() {
    return this.cy.get('#link-tab-settings')
  }

  get contactAuthorCheckbox() {
    return this.cy.get('#proposal_form_canContact_field')
  }

  get parameterSubmitButton() {
    return this.cy.get('#parameters-submit')
  }

  saveParametersForm() {
    this.parameterSubmitButton.click()
  }

})()