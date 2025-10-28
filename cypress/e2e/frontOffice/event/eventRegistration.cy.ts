import { Base, Event } from '~e2e-pages/index'

describe('Event Registration', () => {
  const eventUrl = `/events/event-with-registrations`

  before(() => {
    cy.task('db:restore')
  })

  context('Anonymous user registration', () => {
    beforeEach(() => {
      cy.task('enable:feature', 'calendar')
      Base.visit({ path: eventUrl, operationName: 'CommentSectionQuery' })
    })

    it('should allow anonymous user to register with visible name', () => {
      Event.openRegistrationModal()
      Event.fillRegistration()

      cy.contains('event_registration.create.register_success').should('exist', { timeout: 10000 })
    })

    it('should block registration with already registered email', () => {
      Event.openRegistrationModal()
      Event.fillRegistration()

      Base.visitHomepage({ withIntercept: true })
      Base.visit({ path: eventUrl, operationName: 'CommentSectionQuery' })

      Event.openRegistrationModal()
      Event.fillRegistration()

      cy.get('#email-error').should('exist')
    })
  })

  context('Logged in user registration', () => {
    beforeEach(() => {
      cy.task('enable:feature', 'calendar')
      cy.directLoginAs('user')
      Base.visit({ path: eventUrl, operationName: 'CommentSectionQuery' })
    })

    it('should allow logged in user to register with one click', () => {
      Event.openRegistrationModal()
      cy.contains('event_registration.create.register_success').should('exist', { timeout: 10000 })
      cy.contains('event_registration.unsubscribe').should('exist', { timeout: 10000 })
    })
  })
})
