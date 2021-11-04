import { DebatePage } from '../pages'

describe('Debate', () => {
  it('should correctly show a debate', () => {
    DebatePage.visitCannabisDebate()
    cy.contains('Pour ou contre la légalisation du Cannabis ?').should('exist')
  })
  describe('Logged-in', () => {
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
  describe('Anonymous', () => {
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
