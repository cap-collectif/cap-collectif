describe('Newsletter', () => {
  before(() => {
    cy.task('db:restore')
    cy.task('enable:feature', 'newsletter')
  })
  beforeEach(() => {
    cy.task('enable:feature', 'display_map')
    cy.interceptGraphQLOperation({ operationName: 'NavbarQuery' })
    cy.interceptGraphQLOperation({ operationName: 'LastProposalsQuery' })
    cy.interceptGraphQLOperation({ operationName: 'ProjectsListQuery' })
    cy.interceptGraphQLOperation({ operationName: 'SubscribeNewsletterMutation' })
    cy.visit('/')
    cy.wait('@LastProposalsQuery', { timeout: 10000 })
    cy.wait('@ProjectsListQuery', { timeout: 10000 })
  })

  it('User wants to subscribe to newsletter, without captcha', () => {
    cy.task('disable:feature', 'captcha')
    cy.task('disable:feature', 'turnstile_captcha')
    cy.visit('/')
    cy.get('#newsletter_subscription_email').type('iwantsomenews@gmail.com')
    cy.contains('global.register').click({ force: true })
    cy.contains('registration.constraints.captcha.invalid').should('not.be.visible')
    cy.wait('@SubscribeNewsletterMutation', { timeout: 10000 })
    cy.contains('homepage.newsletter.success')
  })

  it('User wants to subscribe to newsletter with existing email', () => {
    cy.task('disable:feature', 'captcha')
    cy.task('disable:feature', 'turnstile_captcha')
    cy.visit('/')

    cy.get('#newsletter_subscription_email').type('iwantsomenews@gmail.com')
    cy.contains('global.register').click({ force: true })
    cy.contains('registration.constraints.captcha.invalid').should('not.be.visible')
    cy.wait('@SubscribeNewsletterMutation', { timeout: 10000 })
    cy.contains('newsletter.already_subscribed')
  })

  it('User wants to subscribe to newsletter, with unchecked captcha', () => {
    cy.task('enable:feature', 'captcha')
    cy.task('enable:feature', 'turnstile_captcha')
    cy.visit('/')

    Cypress.on('uncaught:exception', (err, runnable) => {
      // returning false here prevents Cypress from failing the test
      return false
    })

    cy.get('#newsletter_subscription_email').type('iwantsomenews2@gmail.com')
    cy.contains('global.register').click({ force: true })
    cy.contains('registration.constraints.captcha.invalid').should('be.visible')
  })

  it('User wants to subscribe to newsletter, with checked captcha', () => {
    cy.task('enable:feature', 'captcha')
    cy.task('enable:feature', 'turnstile_captcha')

    cy.get('#newsletter_subscription_email').type('iwantsomenews2@gmail.com')
    cy.confirmCaptcha()
    cy.wait(500) // wait for captcha validation
    cy.contains('global.register').click({ force: true })
    cy.contains('registration.constraints.captcha.invalid').should('not.be.visible')
    cy.wait('@SubscribeNewsletterMutation', { timeout: 10000 })
    cy.contains('homepage.newsletter.success')
  })
})
