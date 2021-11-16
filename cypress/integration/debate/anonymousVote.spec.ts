import { DebatePage } from '~e2e-pages/index'

describe('Debate', () => {
  describe('Anonymous vote', () => {
    beforeEach(() => {
      cy.task('db:restore')
      DebatePage.visitCannabisDebate()
      cy.wait(1000) // Anonymous captcha widget forces us to wait here
    })
    it('should correctly vote for a debate', () => {
      cy.interceptGraphQLOperation({ operationName: 'AddDebateAnonymousVoteMutation' })
      DebatePage.forButton.click({ force: true })
      cy.contains('publish-anonymous-debate-vote-bot').should('exist')
      cy.confirmRecaptcha()
      cy.wait('@AddDebateAnonymousVoteMutation')
      cy.contains('thanks-for-your-vote').should('exist')
      cy.contains('delete.vote.for').should('exist')
    })
    it('should correctly vote against a debate', () => {
      cy.interceptGraphQLOperation({ operationName: 'AddDebateAnonymousVoteMutation' })
      DebatePage.againstButton.click({ force: true })
      cy.contains('publish-anonymous-debate-vote-bot').should('exist')
      cy.confirmRecaptcha()
      cy.wait('@AddDebateAnonymousVoteMutation')
      cy.contains('thanks-for-your-vote').should('exist')
      cy.contains('delete.vote.against').should('exist')
    })
  })
})
