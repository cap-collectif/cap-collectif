import UserRegistration from '~e2e-pages/admin/user/userRegistration'
import { Base } from '~e2e-pages/index'

context('Register as a user', () => {
  describe('User register with any features', () => {
    beforeEach(() => {
      cy.task('db:restore')
      cy.task('enable:feature', 'registration')
      cy.task('enable:feature', 'user_type')
      cy.task('enable:feature', 'zipcode_at_register')
      cy.task('enable:feature', 'captcha')
      cy.task('enable:feature', 'turnstile_captcha')
      Base.visitHomepage({ withIntercept: true })
      cy.get('#registration-button', { timeout: 20000 }).should('exist').and('be.visible').click({ force: true })
      cy.get('#username').should('be.visible')
      cy.interceptGraphQLOperation({ operationName: 'RegisterMutation' })
      cy.get('#cookie-consent').click({ force: true })
    })

    it('should register with user type and zipcode', () => {
      UserRegistration.fillUser()
      cy.get('[name=zipcode]').type('94123')
      cy.get('#userType').click({ force: true })
      cy.get('[class*=cap-select__option]').contains('Citoyen').click({ force: true })

      UserRegistration.fillFormDefault()

      cy.get('div[id^=turnstile_captcha-]').should('exist')

      UserRegistration.confirmRegister()
    })

    it('should register without user type or zipcode', () => {
      UserRegistration.fillUser()
      UserRegistration.fillFormDefault()
      UserRegistration.confirmRegister()
    })

    it('should show errors with invalid registration data', () => {
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

    it('should register with consent to external communication', () => {
      cy.task('enable:feature', 'consent_external_communication')

      UserRegistration.fillUser()
      UserRegistration.fillFormDefault()

      cy.get('[name="consentExternalCommunication"]').check({ force: true })

      UserRegistration.confirmRegister()
    })

    it('should register with consent to internal communication', () => {
      cy.task('enable:feature', 'consent_internal_communication')

      UserRegistration.fillUser()
      UserRegistration.fillFormDefault()

      cy.get('[name="consentInternalCommunication"]').check({ force: true })

      UserRegistration.confirmRegister()
    })
  })
})
