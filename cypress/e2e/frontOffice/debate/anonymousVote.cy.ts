import { DebatePage } from '~e2e-pages/index'

// ------------------- AS ANONYMOUS USER -------------------
describe('Debate - Anonymous vote', () => {
  // !captcha validation is highly flaky in this test
  // it has to be this much for now
  beforeEach(() => {
    cy.task('db:restore')
    DebatePage.visitCannabisDebate()
  })
  it('should correctly vote for a debate', () => {
    cy.interceptGraphQLOperation({ operationName: 'AddDebateAnonymousVoteMutation' })
    DebatePage.clickOnVoteForButton()
    cy.contains('publish-anonymous-debate-vote-bot').should('exist')
    cy.wait(1000) // wait for the captcha
    cy.confirmCaptcha()
    cy.wait(1000) // wait for the captcha
    cy.wait('@AddDebateAnonymousVoteMutation')
    cy.contains('thanks-for-your-vote').should('exist')
    cy.contains('delete.vote.for').should('exist')
  })
  it('should correctly vote against a debate', () => {
    cy.interceptGraphQLOperation({ operationName: 'AddDebateAnonymousVoteMutation' })
    DebatePage.clickOnVoteAgainstButton()
    cy.contains('publish-anonymous-debate-vote-bot').should('exist')
    cy.wait(1000) // wait for the captcha
    cy.confirmCaptcha()
    cy.wait(1000) // wait for the captcha

    cy.wait('@AddDebateAnonymousVoteMutation')
    cy.contains('thanks-for-your-vote').should('exist')
    cy.contains('delete.vote.against').should('exist')
  })
})
