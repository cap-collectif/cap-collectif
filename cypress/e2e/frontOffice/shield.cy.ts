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

  // -------------------- Anonymous user authentication --------------------
  it('should see shield, cannot register but can connect', () => {
    Base.visitHomepage({ operationName: 'ShieldPageQuery' })
    cy.get('#shield-mode').should('be.visible')

    cy.get('[name="username"]').type('user@test.com')
    cy.get('[name="password"]').type('user')

    cy.contains('button', 'login_me').click()
    cy.get('#navbar-username').should('contain', 'user')

    cy.get('#shield-mode').should('not.exist')
  })

  // -------------------- Unconfirmed user authentication --------------------
  it('should show error for unvalidated user trying to login', () => {
    Base.visitHomepage({ operationName: 'ShieldPageQuery' })

    cy.get('#shield-mode').should('be.visible')

    cy.get('[name="username"]').type('user_not_confirmed@test.com')
    cy.get('[name="password"]').type('user_not_confirmed')

    cy.contains('button', 'login_me').click()

    cy.get('#login-error').should('be.visible')
    cy.contains('please-confirm-your-email-address-to-login').should('be.visible')
  })

  // -------------------- Registration with shield enabled --------------------
  it('should see shield and registration button', () => {
    cy.task('enable:feature', 'registration')
    Base.visitHomepage({ operationName: 'ShieldPageQuery' })

    cy.get('#shield-mode').should('be.visible')
    cy.get('#shield-agent').should('be.visible')
    cy.get('#registration-button').should('be.visible')

    cy.contains('registration').should('be.visible')
  })

  after(() => {
    cy.task('disable:feature', 'shield_mode') // prevent impacting other tests
  })
})
