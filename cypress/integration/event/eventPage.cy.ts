import { EventPage } from '~e2e/pages'

describe('Event Page', () => {
  describe('Event author want to export guests list', () => {
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
      EventPage.downloadAction.click()
      cy.get('body').should('not.contain', '404')
      cy.get('body').should('not.contain', '500')
    })
  })
})
