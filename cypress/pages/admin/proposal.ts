export default new (class AdminproposalPage {
  get cy() {
    return cy
  }

  path(proposalName: string) {
    return `admin/capco/app/proposal/${proposalName}/edit`
  }

  visit(proposalName: string) {
    return this.cy.visit(this.path(proposalName))
  }

  get proposalTitleInput() {
    return this.cy.get('#proposal_title')
  }

  get proposalSummaryInput() {
    return this.cy.get('textarea[name="summary"]')
  }

  get proposalBodyInput() {
    return this.cy.get('#proposal_body .jodit-wysiwyg')
  }

  get proposalCustomResponse() {
    return this.cy.get('#proposal-admin-edit-responses2')
  }

  get proposalPrivateResponse() {
    return this.cy.get('#proposal-admin-edit-responses1')
  }

  fillProposalInputs(title: string, summary: string, body: string, response: string, privateResponse: string) {
    this.proposalTitleInput.clear().type(title)
    this.proposalSummaryInput.clear().type(summary)
    this.proposalBodyInput.clear().type(body)
    this.proposalCustomResponse.clear().type(response)
    this.proposalPrivateResponse.clear().type(privateResponse)
  }

  fillAddressField(address: string) {
    this.cy.get('#proposal_address').clear().type(address)
    this.cy.get('#list-suggestion > li:first-child').click()
  }

  selectCategory(category: string) {
    this.cy.get('select[id="global.category"]').select(category)
  }

  uploadMediaFile() {
    this.cy.get('#proposal_media_field').selectFile('fixtures/image.jpg', { force: true })
    this.cy.wait(1500)
  }

  uploadDocumentFile() {
    this.cy.get('#proposal-admin-edit-responses3_field').selectFile('fixtures/document.pdf', { force: true })
    this.cy.wait(1500)
  }

  save() {
    this.saveButton.click()
  }

  get saveButton() {
    return this.cy.contains('global.save')
  }
})()
