import { Base, Event } from '~e2e-pages/index'

const eventUrl = `/events/event-with-registrations`
const visitEventPage = () => {
  Base.visit({ path: eventUrl, operationName: 'EventPageQuery' })
  cy.get('@EventPageQuery').its('response.statusCode').should('eq', 200)
  cy.get('@EventPageQuery').its('response.body.errors').should('not.exist')
}

context('Event registration as anonymous user', () => {
  beforeEach(() => {
    cy.task('db:restore')
    cy.task('enable:feature', 'calendar')
    visitEventPage()
  })

  it('allows anonymous user to register with visible name', () => {
    Event.openRegistrationModal()
    Event.fillRegistration()

    cy.contains('event_registration.create.register_success').should('exist').and('be.visible')
  })

  it('prevents registration with already registered email', () => {
    Event.openRegistrationModal()
    Event.fillRegistration()

    Base.visitHomepage()
    visitEventPage()

    Event.openRegistrationModal()
    Event.fillRegistration()

    cy.get('#email-error').should('exist').and('be.visible')
  })
})

context('Event registration as logged in user', () => {
  before(() => {
    cy.task('enable:feature', 'calendar')
    cy.directLoginAs('user')
  })

  it('should allow logged in user to register with one click', () => {
    visitEventPage()
    Event.openRegistrationModal()
    cy.contains('event_registration.create.register_success').should('be.visible')
    cy.contains('event_registration.unsubscribe').should('be.visible')
  })
})
