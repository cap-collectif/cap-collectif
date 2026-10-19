import { Base, Event } from '~e2e-pages/index'
import { setupFeatureFlags } from '../../../support/setupFeatureFlags'

const eventUrl = `/events/event-with-registrations`
const visitEventPage = () => {
  Base.visit({ path: eventUrl, operationName: 'EventPageQuery' })
  cy.get('@EventPageQuery').its('response.statusCode').should('eq', 200)
  cy.get('@EventPageQuery').its('response.body.errors').should('not.exist')
}

/**
 * @cypress-status reference
 * @cypress-reason Canonical example for an anonymous form workflow with isolated data and feature setup.
 */
context('Event registration as anonymous user', () => {
  setupFeatureFlags({ calendar: true })

  beforeEach(() => {
    cy.task('db:restore')
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

    Base.visitHomepage({ operationName: 'NavBarQueryNewQuery' })
    visitEventPage()

    Event.openRegistrationModal()
    Event.fillRegistration()

    cy.get('#email-error').should('exist').and('be.visible')
  })
})

/**
 * @cypress-status reference
 * @cypress-reason Canonical example for a logged-in user workflow with explicit GraphQL synchronisation.
 */
context('Event registration as logged in user', () => {
  setupFeatureFlags({ calendar: true })

  beforeEach(() => {
    cy.task('db:restore')
    cy.directLoginAs('user')
  })

  after(() => {
    cy.task('db:restore')
  })

  it('should allow logged in user to register with one click', () => {
    visitEventPage()
    Event.openRegistrationModal()
    cy.contains('event_registration.create.register_success').should('be.visible')
    cy.contains('event_registration.unsubscribe').should('be.visible')
  })
})
