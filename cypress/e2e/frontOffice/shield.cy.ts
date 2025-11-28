import { Base } from '~e2e-pages/index'

describe('Shield Mode', () => {
  before(() => {
    cy.task('enable:feature', 'shield_mode')
    cy.task('disable:feature', 'registration')
  })

  after(() => {
    cy.task('disable:feature', 'shield_mode')
    cy.task('enable:feature', 'registration')
  })

  context('@database - Anonymous user authentication', () => {
    it('should see shield, cannot register but can connect', () => {
      Base.visitHomepage({ operationName: 'ShieldPageQuery' })

      cy.get('#shield-mode').should('be.visible')

      cy.get('[name="username"]').type('user@test.com')
      cy.get('[name="password"]').type('user')

      cy.contains('button', 'login_me').click()

      cy.get('#navbar-username').should('contain', 'user')

      cy.get('#shield-mode').should('not.exist')
    })
  })

  context('@database - Unconfirmed user login attempt', () => {
    it('should show error for unvalidated user trying to login', () => {
      Base.visitHomepage({ operationName: 'ShieldPageQuery' })

      cy.get('#shield-mode', { timeout: 10000 }).should('be.visible')

      cy.get('[name="username"]').type('user_not_confirmed@test.com')
      cy.get('[name="password"]').type('user_not_confirmed')

      cy.contains('button', 'login_me').click()

      cy.get('#login-error', { timeout: 10000 }).should('be.visible')
      cy.contains('please-confirm-your-email-address-to-login', { timeout: 5000 }).should('be.visible')
    })
  })

  context('Registration with shield enabled', () => {
    before(() => {
      cy.task('enable:feature', 'registration')
    })

    it('should see shield and registration button', () => {
      Base.visitHomepage({ operationName: 'ShieldPageQuery' })

      cy.get('#shield-mode', { timeout: 10000 }).should('be.visible')
      cy.get('#shield-agent', { timeout: 10000 }).should('be.visible')
      cy.get('#registration-button', { timeout: 10000 }).should('be.visible')

      cy.contains('registration', { timeout: 5000 }).should('be.visible')
    })
  })
})
