import { EventFormPage } from 'cypress/pages/index'

const approvedEventId = 'RXZlbnQ6ZXZlbnRDcmVhdGVCeUFVc2VyUmV2aWV3QXBwcm92ZWQ='
const awaitingEventId = 'RXZlbnQ6ZXZlbnRDcmVhdGVCeUFVc2VyUmV2aWV3QXdhaXRpbmc='
const eventTitle = 'Mon super event'
const eventBody = 'Lorem ipsum blablabla'
const eventMeta = 'Event : Mon super Event - Lorem...'
const eventCode = '<style></style>'
const eventJauge = 42
const eventModerationReason = 'I am offended on peut plus rien dire rhalala'

describe('Event Admin Page', () => {
  beforeEach(() => {
    cy.task('db:restore')
  })
  before(() => {
    cy.task('enable:feature', 'multilangue')
  })
  it('Create an event', () => {
    cy.directLoginAs('admin')
    cy.interceptGraphQLOperation({ operationName: 'EventFormWrapper_ViewerQuery' })
    cy.interceptGraphQLOperation({ operationName: 'AddEventMutation' })
    cy.interceptGraphQLOperation({ operationName: 'StepListFieldQuery' })
    cy.interceptGraphQLOperation({ operationName: 'DistrictListFieldQuery' })
    cy.interceptGraphQLOperation({ operationName: 'ProjectListFieldQuery' })
    cy.interceptGraphQLOperation({ operationName: 'ThemeListFieldQuery' })
    EventFormPage.visitNewEventPage()
    cy.wait('@EventFormWrapper_ViewerQuery', { timeout: 15000 })
    EventFormPage.fillTitle(eventTitle)
    EventFormPage.fillBody(eventBody)
    EventFormPage.fillStartDate('2025-12-31')
    EventFormPage.toggleRegistrationAccordion()
    EventFormPage.chooseRegistrationType('PLATFORM')
    EventFormPage.toggleIsMeasurable()
    EventFormPage.fillParticipantsJauge(eventJauge)
    cy.wait('@ProjectListFieldQuery', { timeout: 15000 })
    cy.wait('@DistrictListFieldQuery', { timeout: 15000 })
    cy.wait('@ThemeListFieldQuery', { timeout: 15000 })
    EventFormPage.selectEntity('themes')
    EventFormPage.selectEntity('projects')
    cy.wait('@StepListFieldQuery', { timeout: 15000 })
    EventFormPage.selectEntity('steps')
    EventFormPage.selectEntity('districts')
    EventFormPage.toggleAdvancedAccordion()
    EventFormPage.fillMeta(eventMeta)
    EventFormPage.fillCustomCode(eventCode)
    cy.interceptGraphQLOperation({ operationName: 'EventFormWrapperQuery' })
    EventFormPage.clickCreateAndPublishButton()
    cy.wait('@AddEventMutation', { timeout: 15000 })
    cy.wait('@EventFormWrapperQuery', { timeout: 15000 })
    EventFormPage.frTitle.invoke('val').should('eq', eventTitle)
    EventFormPage.frBody.contains(eventBody)
    EventFormPage.toggleAdvancedAccordion()
    EventFormPage.frMeta.invoke('val').should('eq', eventMeta)
    EventFormPage.code.invoke('val').should('eq', eventCode)
    EventFormPage.toggleRegistrationAccordion()
    EventFormPage.maxRegistrations.invoke('val').should('eq', eventJauge.toString())
  })

  it('Delete an event', () => {
    cy.directLoginAs('admin')
    cy.interceptGraphQLOperation({ operationName: 'EventFormWrapperQuery' })
    cy.interceptGraphQLOperation({ operationName: 'EventListQuery' })
    cy.interceptGraphQLOperation({ operationName: 'DeleteEventMutation' })
    EventFormPage.visitEventWithId(awaitingEventId)
    cy.wait('@EventFormWrapperQuery', { timeout: 20000 })
    EventFormPage.openDeleteModal()
    EventFormPage.clickDeleteConfirmationButton()
    // eslint-disable-next-line jest/valid-expect, jest/valid-expect-in-promise
    cy.wait('@DeleteEventMutation').then(interception => {
      // eslint-disable-next-line jest/valid-expect
      expect(interception?.response?.body.data.deleteEvent.deletedEventId).to.equal(awaitingEventId)
    })
    cy.wait('@EventListQuery', { timeout: 15000 })
  })
  it('Can moderate an event as a simple admin', () => {
    cy.directLoginAs('admin')
    cy.task('enable:feature', 'allow_users_to_propose_events')
    cy.interceptGraphQLOperation({ operationName: 'EventFormWrapperQuery' })
    cy.interceptGraphQLOperation({ operationName: 'ReviewEventMutation' })
    EventFormPage.visitEventWithId(awaitingEventId)
    cy.wait('@EventFormWrapperQuery', { timeout: 20000 })
    EventFormPage.frTitle.should('be.disabled')
    EventFormPage.togglePublicationAccordion()
    EventFormPage.refuseEventRadio.should('not.be.disabled')
    EventFormPage.approveEventRadio.should('not.be.disabled')
    EventFormPage.declineAnEventWithReason(eventModerationReason)
    cy.interceptGraphQLOperation({ operationName: 'EventFormWrapperQuery' })
    EventFormPage.clickSaveButton()
    // eslint-disable-next-line jest/valid-expect-in-promise
    cy.wait('@ReviewEventMutation').then(() => {
      cy.reload()
    })
    cy.wait('@EventFormWrapperQuery', { timeout: 20000 })
    EventFormPage.togglePublicationAccordion()
    EventFormPage.moderationComment.invoke('val').should('eq', eventModerationReason)
  })
  it('Cannot edit an already moderated event as a simple admin', () => {
    cy.directLoginAs('admin')
    cy.task('enable:feature', 'allow_users_to_propose_events')
    cy.interceptGraphQLOperation({ operationName: 'EventFormWrapperQuery' })
    EventFormPage.visitEventWithId(approvedEventId)
    cy.wait('@EventFormWrapperQuery', { timeout: 20000 })
    EventFormPage.togglePublicationAccordion()
    EventFormPage.refuseEventRadio.should('be.disabled')
    EventFormPage.approveEventRadio.should('be.disabled')
    EventFormPage.frTitle.should('be.disabled')
  })
  it('Can edit an already moderated event as a superAdmin', () => {
    cy.directLoginAs('super_admin')
    cy.task('enable:feature', 'allow_users_to_propose_events')
    cy.interceptGraphQLOperation({ operationName: 'EventFormWrapperQuery' })
    EventFormPage.visitEventWithId(approvedEventId)
    cy.wait('@EventFormWrapperQuery', { timeout: 20000 })
    EventFormPage.togglePublicationAccordion()
    EventFormPage.refuseEventRadio.should('not.be.disabled')
    EventFormPage.approveEventRadio.should('not.be.disabled')
    EventFormPage.frTitle.should('not.be.disabled')
  })
})
