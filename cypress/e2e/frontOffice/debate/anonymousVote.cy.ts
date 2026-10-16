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
    // eslint-disable-next-line no-fixed-wait -- Captcha completion cannot be intercepted.
    cy.wait(1000)
    cy.confirmCaptcha()
    // eslint-disable-next-line no-fixed-wait -- Captcha completion cannot be intercepted.
    cy.wait(1000)
    cy.wait('@AddDebateAnonymousVoteMutation')
    cy.contains('thanks-for-your-vote').should('exist')
    cy.contains('delete.vote.for').should('exist')
  })
  it('should correctly vote against a debate', () => {
    cy.interceptGraphQLOperation({ operationName: 'AddDebateAnonymousVoteMutation' })
    DebatePage.clickOnVoteAgainstButton()
    cy.contains('publish-anonymous-debate-vote-bot').should('exist')
    // eslint-disable-next-line no-fixed-wait -- Captcha completion cannot be intercepted.
    cy.wait(1000)
    cy.confirmCaptcha()
    // eslint-disable-next-line no-fixed-wait -- Captcha completion cannot be intercepted.
    cy.wait(1000)

    cy.wait('@AddDebateAnonymousVoteMutation')
    cy.contains('thanks-for-your-vote').should('exist')
    cy.contains('delete.vote.against').should('exist')
  })
})
