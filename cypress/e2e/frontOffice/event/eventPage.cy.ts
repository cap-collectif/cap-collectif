import { Base, EventPage } from '~e2e/pages'
import { setupFeatureFlags } from '../../../support/setupFeatureFlags'

describe('Event Page - Event author want to export guests list', () => {
  setupFeatureFlags({ calendar: true, export: true, allow_users_to_propose_events: true })

  before(() => {
    cy.task('db:restore')
  })

  beforeEach(() => {
    cy.directLoginAs('user')
  })

  /**
   * @cypress-status compliant
   * @cypress-reason Checks the author's real download through the event menu; CSV contents are covered by PHPUnit.
   */
  it('exports guests list as Event author', () => {
    EventPage.visitEventApprovedWithRegistration()
    EventPage.quickActionButton.should('be.visible').click()
    cy.intercept('GET', '/export-my-event-participants/eventCreateByAUserReviewApproved').as('downloadParticipants')
    cy.get('#download-event-registration').should('be.visible').click()
    return cy.wait('@downloadParticipants').then(({ response }) => {
      assert.equal(response?.statusCode, 200)
      assert.include(response?.headers['content-type'], 'text/csv')
      assert.include(response?.headers['content-disposition'], 'attachment')
    })
  })

  it('should show deleted cancelled event message', () => {
    cy.interceptGraphQLOperation({ operationName: 'EventPageQuery' })
    EventPage.visit({ event: 'event-deleted' })

    cy.get('.cap-text').contains('event-cancelled')
  })
})

describe('Events feature', () => {
  setupFeatureFlags({ calendar: true })

  before(() => {
    cy.task('db:restore')
  })

  it('should see events list', () => {
    Base.visit({ path: '/events', operationName: 'EventRefetchRefetchQuery' })
    cy.get('.eventPreview', { timeout: 23000 }).should('have.length', 15) // enforcing longer timout due to slow loading
  })

  it('should filter by projects and status', () => {
    cy.setFeatureFlags({ projects_form: true })
    Base.visit({ path: '/events', operationName: 'EventRefetchRefetchQuery' })

    cy.get('#event-button-filter').click({ force: true })
    cy.get('#SelectProject-filter-project .react-select__value-container').click({ force: true })
    cy.contains('Croissance, innovation, disruption').click({ force: true })

    cy.wait('@EventRefetchRefetchQuery')
    cy.get('.eventPreview').should('have.length', 4)
  })

  it('comments an event', () => {
    Base.visit({
      path: '/events/event-with-registrations',
      operationName: 'CommentSectionQuery',
    })

    cy.get('#CommentForm').should('exist')
    cy.get('textarea[name="body"]').type("J'ai un truc à dire")
    cy.get('input[name="authorName"]').type('Naruto')
    cy.get('input[name="authorEmail"]').type('naruto72@gmail.com')

    cy.interceptGraphQLOperation({ operationName: 'AddCommentMutation' })
    cy.get('#comment-submit').click({ force: true })
    cy.wait('@AddCommentMutation')

    cy.get('#CommentListViewPaginated').should('contain', "J'ai un truc à dire")
  })

  it('displays create button if feature enable and asks for login', () => {
    cy.setFeatureFlags({ allow_users_to_propose_events: false })
    cy.interceptGraphQLOperation({ operationName: 'EventRefetchRefetchQuery' })
    Base.visit({ path: '/events', operationName: 'EventRefetchRefetchQuery' })
    cy.get('#btn-create-event').should('not.exist')

    cy.setFeatureFlags({ allow_users_to_propose_events: true })
    Base.visit({ path: '/events', operationName: 'EventRefetchRefetchQuery' })
    cy.get('#btn-create-event').click({ force: true })
    cy.get('#login-popover').should('exist')
  })

  it('comments an event without email', () => {
    Base.visit({
      path: '/events/event-with-registrations',
      operationName: 'CommentSectionQuery',
    })
    cy.get('#CommentForm').should('exist')

    cy.get('textarea[name="body"]').type("J'ai un truc à dire")
    cy.get('input[name="authorName"]').type('Naruto')

    cy.interceptGraphQLOperation({ operationName: 'AddCommentMutation' })
    cy.get('#comment-submit').click({ force: true })
    cy.wait('@AddCommentMutation')

    cy.get('#CommentListViewPaginated').contains("J'ai un truc à dire")
  })

  it('should not create event', () => {
    cy.setFeatureFlags({ allow_users_to_propose_events: false })
    Base.visit({ path: '/events', operationName: 'EventRefetchRefetchQuery' })
    cy.contains('event-proposal').should('not.exist')
  })

  it('comments an event as a user', () => {
    cy.directLoginAs('user')
    Base.visit({
      path: '/events/event-with-registrations',
      operationName: 'CommentSectionQuery',
    })

    cy.get('#CommentForm').should('exist')
    cy.get('textarea[name="body"]').type("J'ai un truc à dire")

    cy.contains('comment.with_my_account').should('not.exist')
  })

  it('should create an event if logged', () => {
    cy.directLoginAs('user')
    cy.setFeatureFlags({ themes: true, projects_form: true, allow_users_to_propose_events: true })

    Base.visit({ path: '/events', operationName: 'EventRefetchRefetchQuery' })

    cy.get('#btn-create-event').should('be.visible').click({ force: true })
    cy.get('#confirm-event-submit').should('exist')
    cy.get('#event_title').should('exist').type('My event')
    cy.get('#event_address').type('Paris').type('{enter}')
    cy.get('#event_body').type('My body')
    cy.get('#event_input_startAt').type('2050-08-17 12:13:14')

    cy.get('#confirm-event-submit').click({ force: true })
    cy.get('#event_authorAgreeToUsePersonalDataForEventOnly-error').should('exist')
    cy.get('#label-checkbox-event_authorAgreeToUsePersonalDataForEventOnly').click({ force: true })

    cy.interceptGraphQLOperation({ operationName: 'AddEventMutation' })
    cy.get('#confirm-event-submit').click({ force: true })
    cy.wait('@AddEventMutation')

    cy.url().should('include', '/events/my-event')
    cy.get('#event-label-status').should('contain', 'waiting-examination')
  })
})
