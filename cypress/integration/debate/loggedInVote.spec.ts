import { DebatePage } from '~e2e-pages/index'

describe('Debate', () => {
  describe('Logged-in vote', () => {
    beforeEach(() => {
      cy.task('db:restore')
      cy.directLoginAs('user')
      DebatePage.visitCannabisDebate()
    })
    it('should correctly vote for a debate', () => {
      DebatePage.forButton.click({ force: true })
      cy.contains('thanks-for-your-vote').should('exist')
    })
    it('should correctly vote against a debate', () => {
      DebatePage.againstButton.click({ force: true })
      cy.contains('thanks-for-your-vote').should('exist')
    })
  })
})
