import { Base, UserRegistration } from '~e2e-pages/index'
import { setupFeatureFlags } from '../../../support/setupFeatureFlags'

context('Register as a user', () => {
  describe('User register with any features', () => {
    setupFeatureFlags({
      registration: true,
      user_type: true,
      zipcode_at_register: true,
      captcha: true,
      turnstile_captcha: true,
    })

    beforeEach(() => {
      cy.task('db:restore')
    })
    Cypress.on('uncaught:exception', (err, runnable) => {
      // returning false here prevents Cypress from failing the test
      return false
    })

    it('should register with user type and zipcode', () => {
      Base.visitHomepage()
      UserRegistration.clickRegistrationButton()
      cy.get('#username').should('be.visible')

      UserRegistration.consentToCookies()
      UserRegistration.fillUser()
      cy.get('[name=zipcode]').type('94123')
      cy.get('#userType').click({ force: true })
      cy.get('[class*=cap-select__option]').contains('Citoyen').click({ force: true })

      UserRegistration.fillFormDefault()

      cy.get('div[id^=turnstile_captcha-]').should('exist')

      UserRegistration.confirmRegister()
    })

    it('should register without user type or zipcode', () => {
      Base.visitHomepage()
      UserRegistration.clickRegistrationButton()
      cy.get('#username').should('be.visible')
      UserRegistration.consentToCookies()
      UserRegistration.fillUser()
      UserRegistration.fillFormDefault()
      UserRegistration.confirmRegister()
    })

    it('should show errors with invalid registration data', () => {
      Base.visitHomepage()
      UserRegistration.clickRegistrationButton()
      cy.get('#username').should('be.visible')
      UserRegistration.consentToCookies()
      cy.get('[name=username]').type('p')
      cy.get('[name=email]').type('poupouil.com') // invalid
      cy.get('[name=plainPassword]').type('azerty') // weak
      cy.get('[name=zipcode]').type('94')

      cy.get('#confirm-login').click({ force: true })
      cy.get('.cap-modal__body').scrollTo('bottom')

      cy.get('#username-error').should('exist')
      cy.get('#email-error').should('exist')
      cy.get('#charte-error').should('exist')
    })

    it('should register with consent to external & internal communication', () => {
      cy.setFeatureFlags({ consent_external_communication: true, consent_internal_communication: true })

      Base.visitHomepage()
      UserRegistration.clickRegistrationButton()
      cy.get('#username').should('be.visible')
      UserRegistration.consentToCookies()

      UserRegistration.fillUser()
      UserRegistration.fillFormDefault()

      cy.get('#consent-external-communication').check({ force: true })
      cy.get('[name="consentInternalCommunication"]').check({ force: true })

      UserRegistration.confirmRegister()
    })
  })
})
