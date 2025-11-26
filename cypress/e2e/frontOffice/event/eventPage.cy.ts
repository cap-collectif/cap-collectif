import { Base, EventPage } from '~e2e/pages'

describe('Event Page - Event author want to export guests list', () => {
  before(() => {
    cy.task('db:restore')
  })
  beforeEach(() => {
    cy.task('enable:feature', 'calendar')
    cy.task('enable:feature', 'allow_users_to_propose_events')
    cy.task('enable:feature', 'export')
    cy.task('run:command', 'capco:export:events:participants')
    cy.directLoginAs('user')
  })
  it('should export event guest', () => {
    cy.interceptGraphQLOperation({ operationName: 'EventPageQuery' })
    EventPage.visitEventApprovedWithRegistration()
    EventPage.quickActionButton.click({ force: true })

    // TODO remove this block after migrate to cypress 13, this one is only a workaround to fix the issue https://github.com/cypress-io/cypress/issues/14857
    cy.window().then(win => {
      const triggerAutIframeLoad = () => {
        const AUT_IFRAME_SELECTOR = '.aut-iframe'

        // get the application iframe
        const autIframe = win.parent.document.querySelector(AUT_IFRAME_SELECTOR)

        if (!autIframe) {
          throw new ReferenceError(`Failed to get the application frame using the selector '${AUT_IFRAME_SELECTOR}'`)
        }

        autIframe.dispatchEvent(new Event('load'))
        // remove the event listener to prevent it from firing the load event before each next unload (basically before each successive test)
        win.removeEventListener('beforeunload', triggerAutIframeLoad)
      }

      win.addEventListener('beforeunload', triggerAutIframeLoad)
    })

    // TODO: A column is missing in the generated snapshot, we should investigate more when we migrate all export tests from behat to cypress
    cy.get('#download-event-registration')
      .click({ force: true })
      .then(() => {
        cy.request({
          url: '/export-my-event-participants/eventCreateByAUserReviewApproved',
          method: 'GET',
        }).then(response => {
          expect(response.status).not.to.equal(404)
          expect(response.status).not.to.equal(500)
        })
      })
  })

  it('should show deleted cancelled event message', () => {
    cy.interceptGraphQLOperation({ operationName: 'EventPageQuery' })
    EventPage.visit({ event: 'event-deleted' })

    cy.get('.cap-text').contains('event-cancelled')
  })
})

describe('Events feature', () => {
  before(() => {
    cy.task('enable:feature', 'calendar')
  })

  it('should see events list', () => {
    Base.visit({ path: '/events', operationName: 'EventRefetchRefetchQuery' })
    cy.get('.eventPreview').should('have.length', 15)
  })

  it('should filter by projects and status', () => {
    cy.task('enable:feature', 'projects_form')
    Base.visit({ path: '/events', operationName: 'EventRefetchRefetchQuery' })

    cy.get('#event-button-filter').click({ force: true })
    cy.get('#SelectProject-filter-project .react-select__value-container').click({ force: true })
    cy.contains('Croissance, innovation, disruption').click({ force: true })

    cy.wait('@EventRefetchRefetchQuery', { timeout: 10000 })
    cy.get('.eventPreview').should('have.length', 4)
  })

  it('should comment an event', () => {
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
    cy.wait('@AddCommentMutation', { timeout: 10000 })

    cy.get('#CommentListViewPaginated').should('contain', "J'ai un truc à dire")
  })

  it('should display create button if feature enable and should ask for login', () => {
    cy.task('disable:feature', 'allow_users_to_propose_events')
    cy.interceptGraphQLOperation({ operationName: 'EventRefetchRefetchQuery' })
    Base.visit({ path: '/events', operationName: 'EventRefetchRefetchQuery' })
    cy.get('#btn-create-event').should('not.exist')

    cy.task('enable:feature', 'allow_users_to_propose_events')
    Base.visit({ path: '/events', operationName: 'EventRefetchRefetchQuery' })
    cy.get('#btn-create-event').click({ force: true })
    cy.get('#login-popover').should('exist')
  })

  it('should comment an event without email', () => {
    Base.visit({
      path: '/events/event-with-registrations',
      operationName: 'CommentSectionQuery',
    })
    cy.get('#CommentForm').should('exist')

    cy.get('textarea[name="body"]').type("J'ai un truc à dire")
    cy.get('input[name="authorName"]').type('Naruto')

    cy.interceptGraphQLOperation({ operationName: 'AddCommentMutation' })
    cy.get('#comment-submit').click({ force: true })
    cy.wait('@AddCommentMutation', { timeout: 10000 })

    cy.get('#CommentListViewPaginated').contains("J'ai un truc à dire")
  })

  it('should not create event', () => {
    cy.task('disable:feature', 'allow_users_to_propose_events')
    Base.visit({ path: '/events', operationName: 'EventRefetchRefetchQuery' })
    cy.contains('event-proposal').should('not.exist')
  })

  it('should comment an event as a user', () => {
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
    cy.task('enable:feature', 'themes')
    cy.task('enable:feature', 'projects_form')
    cy.task('enable:feature', 'allow_users_to_propose_events')

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
    cy.wait('@AddEventMutation', { timeout: 10000 })

    cy.url().should('include', '/events/my-event')
    cy.get('#event-label-status').should('contain', 'waiting-examination')
  })
})
