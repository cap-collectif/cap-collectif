import { DebatePage } from '~e2e-pages/index'

// ------------------- AS ANONYMOUS USER -------------------
describe('Debate - Anonymous vote', () => {
  beforeEach(() => {
    cy.task('db:restore')
    DebatePage.visitCannabisDebate()
    cy.wait(1000) // Anonymous captcha widget forces us to wait here
  })
  it('should correctly vote for a debate', () => {
    cy.interceptGraphQLOperation({ operationName: 'AddDebateAnonymousVoteMutation' })
    DebatePage.clickOnVoteForButton()
    cy.contains('publish-anonymous-debate-vote-bot').should('exist')
    cy.confirmCaptcha()
    cy.wait(1000) // wait for the captcha

    cy.wait('@AddDebateAnonymousVoteMutation', { timeout: 10000 })
    cy.contains('thanks-for-your-vote').should('exist')
    cy.contains('delete.vote.for').should('exist')
  })
  it('should correctly vote against a debate', () => {
    cy.interceptGraphQLOperation({ operationName: 'AddDebateAnonymousVoteMutation' })
    DebatePage.clickOnVoteAgainstButton()
    cy.contains('publish-anonymous-debate-vote-bot').should('exist')
    cy.confirmCaptcha()
    cy.wait(1000) // wait for the captcha

    cy.wait('@AddDebateAnonymousVoteMutation', { timeout: 10000 })
    cy.contains('thanks-for-your-vote').should('exist')
    cy.contains('delete.vote.against').should('exist')
  })
})
