import { Base } from '~e2e-pages/index'

describe('Vote Token', () => {
  describe('when user votes with a valid token', () => {
    before(() => {
      cy.task('db:restore')
    })

    it('displays success message', () => {
      Base.visit({
        path: '/voteByToken?token=debateVoteToken1&value=FOR',
        operationName: 'NavBarMenuQuery',
      })
      cy.get('.flash-notif').should('be.visible').and('contain.text', 'vote.add_success')
    })
  })

  describe('when user uses an invalid token', () => {
    it('displays invalid token error', () => {
      Base.visit({ path: '/voteByToken?token=wrong&value=FOR', operationName: 'NavbarRightQuery' })
      cy.get('.flash-notif').should('be.visible').and('contain.text', 'invalid-token')
    })
  })

  describe('when user attempts to vote twice', () => {
    before(() => {
      cy.task('db:restore')
    })

    it('displays already used token error', () => {
      Base.visit({
        path: '/voteByToken?token=debateVoteToken1&value=FOR',
        operationName: 'NavBarMenuQuery',
      })
      Base.visit({
        path: '/voteByToken?token=debateVoteToken1&value=FOR',
        operationName: 'NavBarMenuQuery',
      })

      cy.get('.flash-notif').should('be.visible').and('contain.text', 'already-used-token')
    })
  })

  describe('when user has already voted', () => {
    before(() => {
      cy.task('db:restore')
    })

    it('displays already voted error', () => {
      Base.visit({
        path: '/voteByToken?token=debateVoteTokenAlreadyVoted&value=FOR',
        operationName: 'NavBarMenuQuery',
      })
      cy.get('.flash-notif').should('be.visible').and('contain.text', 'global.already_voted')
    })
  })
})
