import { Base } from '~e2e-pages/index'

describe('Newsletter', () => {
  before(() => {
    cy.task('enable:feature', 'newsletter')
  })
  beforeEach(() => {
    cy.task('db:restore')
    cy.interceptGraphQLOperation({ operationName: 'SubscribeNewsletterMutation' })
  })

  Cypress.on('uncaught:exception', (err, runnable) => {
    // returning false here prevents Cypress from failing the test
    return false
  })

  it('correctly handles subscribing, for non-subscribed and subscribed emails, without captcha', () => {
    cy.task('disable:feature', 'captcha')
    cy.task('disable:feature', 'turnstile_captcha')

    // Subscribing with a non-subscribed email should work the first time
    Base.visitHomepage()
    cy.get('#newsletter_subscription_email').type('iwantsomenews@gmail.com')
    cy.contains('global.register').click({ force: true })
    cy.get('registration.constraints.captcha.invalid').should('not.exist')

    cy.wait('@SubscribeNewsletterMutation')
    cy.contains('homepage.newsletter.success').should('exist').and('be.visible')

    // reload page after successfully subscribing
    cy.reload()

    // after reload, try subscribing again:
    // it should not work since the email is already registered now
    cy.get('#newsletter_subscription_email').type('iwantsomenews@gmail.com')
    cy.contains('global.register').click({ force: true })
    cy.contains('registration.constraints.captcha.invalid').should('not.be.visible')
    cy.wait('@SubscribeNewsletterMutation')
    cy.contains('newsletter.already_subscribed')
  })

  it('User wants to subscribe to newsletter, with unchecked captcha', () => {
    cy.task('enable:feature', 'captcha')
    cy.task('enable:feature', 'turnstile_captcha')

    Base.visitHomepage()
    cy.get('#newsletter_subscription_email').type('iwantsomenews2@gmail.com')
    cy.contains('global.register').click({ force: true })
    cy.contains('registration.constraints.captcha.invalid').should('be.visible')
  })

  it('User wants to subscribe to newsletter, with checked captcha', () => {
    cy.task('enable:feature', 'captcha')
    cy.task('enable:feature', 'turnstile_captcha')

    Base.visitHomepage()
    cy.get('#newsletter_subscription_email').type('iwantsomenews2@gmail.com')
    cy.confirmCaptcha()
    cy.wait(1500) // captcha takes longer to proceed

    cy.contains('global.register').click({ force: true })
    cy.contains('registration.constraints.captcha.invalid').should('not.be.visible')
    cy.wait('@SubscribeNewsletterMutation')
    cy.contains('homepage.newsletter.success')
  })
})
