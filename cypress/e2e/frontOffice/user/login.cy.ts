import { Base, Login } from '~e2e-pages/index'

describe('Login Feature', () => {
  before(() => {
    cy.task('db:restore')
  })
  beforeEach(() => {
    cy.logout()
  })

  context('Password Reset', () => {
    before(() => {
      Base.visitHomepage()
      Login.openLoginModal()
    })

    it('should display confirmation message when user requests password reset', () => {
      Login.clickOnForgetPassword()

      cy.get('[name="email"]').type('user@test.com')

      cy.interceptGraphQLOperation({ operationName: 'NavBarQueryNewQuery' })
      cy.contains('button', 'global.submit').click({ force: true })
      cy.wait('@NavBarQueryNewQuery', { timeout: 10000 })

      cy.contains('resetting-check-email').should('be.visible')
      cy.contains('user@test.com').should('be.visible')
    })
  })

  context('Login Attempts with Turnstile CAPTCHA', () => {
    before(() => {
      cy.task('enable:feature', 'restrict_connection')
      cy.task('enable:feature', 'captcha')
      cy.task('enable:feature', 'turnstile_captcha')
    })

    it('should show Turnstile CAPTCHA after 5 failed login attempts', () => {
      Base.visitHomepage()
      Login.openLoginModal()

      for (let attempt = 1; attempt <= 5; attempt++) {
        Login.fillCredentials('lbrunet@cap-collectif.com', 'tot')
        Login.submitLogin()

        cy.get('#login-error', { timeout: 10000 }).should('be.visible')

        if (attempt < 5) {
          cy.get('div[id^="turnstile_captcha-"]').should('not.exist')
        }
      }

      cy.get('div[id^="turnstile_captcha-"]').should('have.length', 1)

      Login.fillCredentials('lbrunet@cap-collectif.com', 'toto')
      Login.submitLogin()

      cy.contains('registration.constraints.captcha.invalid').should('be.visible')
    })
  })

  context('Login Attempts with Google reCAPTCHA', () => {
    before(() => {
      cy.task('enable:feature', 'restrict_connection')
      cy.task('enable:feature', 'captcha')
      cy.task('disable:feature', 'turnstile_captcha')
    })

    it('should show Google reCAPTCHA after 5 failed login attempts', () => {
      Base.visitHomepage()
      Login.openLoginModal()

      for (let attempt = 1; attempt <= 5; attempt++) {
        Login.fillCredentials('lbrunet@cap-collectif.com', 'tot')
        Login.submitLogin()

        cy.get('#login-error', { timeout: 10000 }).should('be.visible')

        if (attempt < 5) {
          cy.get('#recaptcha').should('not.exist')
          cy.get('div[id^="turnstile_captcha-"]').should('not.exist')
        }
      }

      cy.get('#recaptcha', { timeout: 10000 }).should('be.visible')
      cy.get('div[id^="turnstile_captcha-"]').should('not.exist')

      Login.fillCredentials('lbrunet@cap-collectif.com', 'toto')
      Login.submitLogin()

      cy.contains('registration.constraints.captcha.invalid').should('be.visible')
    })
  })
})
