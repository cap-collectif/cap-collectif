export default new (class EventFormPage {
  get cy() {
    return cy
  }

  get frTitle() {
    return this.cy.get('input[type="text"]#FR_FR-title')
  }
  get frBody() {
    return this.cy.get('#FR_FR-body')
  }
  get frMeta() {
    return this.cy.get('#FR_FR-metaDescription')
  }
  get code() {
    return this.cy.get('textarea#customCode')
  }
  get startAt() {
    return this.cy.get('label[for="startAt"] + div input.cap-date-input')
  }
  get maxRegistrations() {
    return this.cy.get('input#maxRegistrations')
  }
  get approveEventRadio() {
    return this.cy.get('input#status_choice-APPROVED')
  }
  get refuseEventRadio() {
    return this.cy.get('input#status_choice-REFUSED')
  }
  get moderationComment() {
    return this.cy.get('textarea#comment')
  }

  visitNewEventPage() {
    this.cy.visit(`/admin-next/event`)
  }
  visitEventWithId(eventId: string) {
    this.cy.visit(`/admin-next/event?id=${eventId}`)
  }
  fillTitle(title: string) {
    this.frTitle.type(title)
  }
  fillBody(body: string) {
    this.frBody.type(body)
  }
  fillMeta(meta: string) {
    this.frMeta.type(meta)
  }
  fillCustomCode(code: string) {
    this.code.type(code)
  }
  fillStartDate(date: string) {
    this.startAt.type(date)
  }
  chooseRegistrationType(type: 'PLATFORM' | 'EXTERNAL' | 'DISABLED') {
    this.cy.get(`input#${type}`).click({ force: true })
  }
  toggleIsMeasurable() {
    this.cy.get('input#isMeasurable').click({ force: true })
  }
  fillParticipantsJauge(count: number) {
    this.maxRegistrations.type(count.toString())
  }
  toggleRegistrationAccordion() {
    this.cy.get('button#accordion-button-registration').click({ force: true })
  }
  toggleAdvancedAccordion() {
    this.cy.get('button#accordion-button-advanced').click({ force: true })
  }
  togglePublicationAccordion() {
    this.cy.get('button#accordion-button-publication').click({ force: true })
  }
  selectEntity(entity: 'themes' | 'projects' | 'steps' | 'districts') {
    this.cy.openDSSelect(`#${entity}`, true)
    this.cy.selectDSSelectFirstOption(true)
  }
  clickCreateAndPublishButton() {
    this.cy.get('button#create-and-publish').click({ force: true })
  }
  clickSaveButton() {
    this.cy.get('button#save-event').click({ force: true })
  }
  openDeleteModal() {
    this.cy.get('button#delete-event').click({ force: true })
  }
  clickDeleteConfirmationButton() {
    this.cy.get('button#delete-event-confirm').click({ force: true })
  }
  declineAnEventWithReason(reason: string) {
    this.refuseEventRadio.click({ force: true })
    this.cy.openDSSelect('#refusedReason')
    this.cy.selectDSSelectFirstOption()
    this.moderationComment.type(reason)
  }
})()
