import { Base, Login } from '~e2e-pages/index'

describe('Login', () => {
  beforeEach(() => {
    cy.task('db:restore')
    cy.purgeEmails()
  })

  it('should show a login button and no logout button if not connected', () => {
    Base.visit({ path: '/legal', operationName: 'NavbarRightQuery' })
    cy.get('#login-button').should('exist')
    cy.get('#logout-button').should('not.exist')
    cy.isLoggedOut()
  })

  it('should be possible to log in as user', () => {
    cy.interceptGraphQLOperation({ operationName: 'NavbarRightQuery' })
    cy.visit('/legal')
    cy.loginAs('user')
    cy.get('#navbar-username').contains('user').should('exist')

    cy.get('#login-button').should('not.exist')
    cy.get('#navbar-username').contains('user').click()
    cy.get('#logout-button').should('exist')
    cy.get('.user-profile').contains('global.administration').should('not.exist')
    cy.get('.user-profile').contains('user.profile.title').should('exist')
    cy.get('.user-profile').contains('global.params').should('exist')
  })

  it('should be possible to log in as admin and access administration', () => {
    Base.visit({ path: '/legal', operationName: 'NavbarRightQuery' })
    cy.loginAs('admin')
    cy.get('#navbar-username').contains('admin').should('exist')
    cy.get('#login-button').should('not.exist')
    cy.get('#navbar-username').contains('admin').click()
    cy.get('#logout-button').should('exist')
    cy.get('.user-profile').contains('global.administration').should('exist')
    cy.get('.user-profile').contains('user.profile.title').should('exist')
    cy.get('.user-profile').contains('global.params').should('exist')
  })

  it('should be possible to log out as user', () => {
    Base.visit({ path: '/legal', operationName: 'NavbarRightQuery' })
    cy.loginAs('user')

    cy.get('#navbar-username').contains('user').should('exist')
    cy.get('#navbar-username').contains('user').click()
    cy.get('.user-profile').contains('global.logout').click()
    cy.get('#login-button').should('exist')
    cy.get('#logout-button').should('not.exist')
  })

  it('should display confirmation message when user requests password reset', () => {
    Base.visit({ path: '/legal', operationName: 'NavbarRightQuery' })
    Login.openLoginModal()
    Login.clickOnForgetPassword()

    cy.get('[name="email"]').type('user@test.com')

    cy.interceptGraphQLOperation({ operationName: 'NavBarQueryNewQuery' })
    cy.contains('button', 'global.submit').click({ force: true })
    cy.wait('@NavBarQueryNewQuery')

    cy.contains('resetting-check-email').should('be.visible')
    cy.contains('user@test.com').should('be.visible')
    cy.openMailTo('user@test.com')
    cy.mailShouldContain('email-content-resetting-password')
  })

  it('should show Turnstile CAPTCHA after 5 failed login attempts', () => {
    cy.task('enable:feature', 'restrict_connection')
    cy.task('enable:feature', 'captcha')
    cy.task('enable:feature', 'turnstile_captcha')

    Base.visit({ path: '/legal', operationName: 'NavbarRightQuery' })
    Login.openLoginModal()

    for (let attempt = 1; attempt <= 5; attempt++) {
      Login.fillCredentials('lbrunet@cap-collectif.com', 'tot')
      Login.submitLogin()
      cy.get('#login-error').should('be.visible')
      if (attempt < 5) {
        cy.get('div[id^="turnstile_captcha-"]').should('not.exist')
      }
    }

    cy.get('div[id^="turnstile_captcha-"]').should('have.length', 1)
    Login.fillCredentials('lbrunet@cap-collectif.com', 'toto')
    Login.submitLogin()
    cy.contains('registration.constraints.captcha.invalid').should('be.visible')

    cy.task('disable:feature', 'restrict_connection')
    cy.task('disable:feature', 'captcha')
    cy.task('disable:feature', 'turnstile_captcha')
  })

  it('should show Google reCAPTCHA after 5 failed login attempts', () => {
    cy.task('enable:feature', 'restrict_connection')
    cy.task('enable:feature', 'captcha')
    cy.task('disable:feature', 'turnstile_captcha')

    Base.visit({ path: '/legal', operationName: 'NavbarRightQuery' })

    Login.openLoginModal()

    for (let attempt = 1; attempt <= 5; attempt++) {
      Login.fillCredentials('lbrunet@cap-collectif.com', 'tot')
      Login.submitLogin()

      cy.get('#login-error').should('be.visible')

      if (attempt < 5) {
        cy.get('#recaptcha').should('not.exist')
        cy.get('div[id^="turnstile_captcha-"]').should('not.exist')
      }
    }

    cy.get('#recaptcha').should('be.visible')
    cy.get('div[id^="turnstile_captcha-"]').should('not.exist')

    Login.fillCredentials('lbrunet@cap-collectif.com', 'toto')
    Login.submitLogin()

    cy.contains('registration.constraints.captcha.invalid').should('be.visible')
    cy.task('disable:feature', 'restrict_connection')
    cy.task('disable:feature', 'captcha')
    cy.task('enable:feature', 'turnstile_captcha')
  })
})
