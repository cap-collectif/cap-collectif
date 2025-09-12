import { InvitationPage } from '~e2e-pages/index'

// TODO: this test file is currently not running in CI - needs to be fixed ASAP.
describe('User invitation', () => {
  beforeEach(() => {
    cy.task('db:restore')
  })
  before(() => {
    cy.task('db:restore')
    cy.task('enable:feature', 'registration')
    cy.task('enable:feature', 'user_type')
    cy.task('enable:feature', 'zipcode_at_register')
    cy.task('enable:feature', 'captcha')
    cy.task('enable:feature', 'turnstile_captcha')

    cy.task('disable:feature', 'login_facebook')
    cy.task('disable:feature', 'login_saml')
    cy.task('disable:feature', 'login_cas')
    cy.task('disable:feature', 'login_openid')
    cy.task('disable:feature', 'login_franceconnect')
  })

  it('An expired invitation should redirect to homepage', () => {
    cy.visit('/invitation?token=sorryiamtheexpiredtoken')
    cy.url().should('eq', `${Cypress.config().baseUrl}/`)
    cy.get('.alert.alert-danger').contains('user-invitation-expired').should('exist').and('be.visible')
  })

  it('An invited user should be able to register', () => {
    cy.interceptGraphQLOperation({ operationName: 'UserInvitationPageAppQuery' })
    cy.visit('/invitation?token=oniiiichaaan')
    cy.wait('@UserInvitationPageAppQuery', { timeout: 10000 })
    InvitationPage.fillInvitationForm()
  })

  it('An invited user should be able to register even with shield mode', () => {
    cy.task('enable:feature', 'shield_mode')
    cy.visit('/invitation?token=oniiiichaaan')
    InvitationPage.fillInvitationForm()
  })

  it('An invited user should be able to register even when registration is disabled', () => {
    cy.task('disable:feature', 'registration')
    cy.visit('/invitation?token=oniiiichaaan')
    InvitationPage.fillInvitationForm()
  })
})
