import { EventPage } from '~e2e/pages'

describe('Event Page - Event author want to export guests list', () => {
  beforeEach(() => {
    cy.task('db:restore')
    cy.task('enable:feature', 'calendar')
    cy.task('enable:feature', 'allow_users_to_propose_events')
    cy.task('enable:feature', 'export')
    cy.task('run:command', 'capco:export:events:participants')
    cy.directLoginAs('user')
  })
  it('should export event guest', () => {
    cy.interceptGraphQLOperation({ operationName: 'EventPageQuery' })
    EventPage.visitEventApprovedWithRegistration()
    EventPage.quickActionButton.click()

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
      .click()
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
})
