import { DebatePage } from '~e2e-pages/index'

describe('Debate - Anonymous vote', () => {
  before(() => {
    cy.task('db:restore')
  })
  beforeEach(() => {
    DebatePage.visitCannabisDebate()
    cy.wait(500) // Anonymous captcha widget forces us to wait here
  })
  it('should correctly vote for a debate', () => {
    cy.interceptGraphQLOperation({ operationName: 'AddDebateAnonymousVoteMutation' })
    DebatePage.forButton.click({ force: true })
    cy.contains('publish-anonymous-debate-vote-bot').should('exist')
    cy.confirmCaptcha()
    cy.wait('@AddDebateAnonymousVoteMutation')
    cy.contains('thanks-for-your-vote').should('exist')
    cy.contains('delete.vote.for').should('exist')
  })
  it('should correctly vote against a debate', () => {
    cy.interceptGraphQLOperation({ operationName: 'AddDebateAnonymousVoteMutation' })
    DebatePage.againstButton.click({ force: true })
    cy.contains('publish-anonymous-debate-vote-bot').should('exist')
    cy.confirmCaptcha()
    cy.wait('@AddDebateAnonymousVoteMutation')
    cy.contains('thanks-for-your-vote').should('exist')
    cy.contains('delete.vote.against').should('exist')
  })
})
