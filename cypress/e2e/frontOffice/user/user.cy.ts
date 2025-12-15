import { Base, UserRegistration } from '~e2e-pages/index'

context('Register as a user', () => {
  describe('User register with any features', () => {
    before(() => {
      cy.task('enable:feature', 'registration')
      cy.task('enable:feature', 'user_type')
      cy.task('enable:feature', 'zipcode_at_register')
      cy.task('enable:feature', 'captcha')
      cy.task('enable:feature', 'turnstile_captcha')
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
      cy.task('enable:feature', 'consent_external_communication')
      cy.task('enable:feature', 'consent_internal_communication')

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
