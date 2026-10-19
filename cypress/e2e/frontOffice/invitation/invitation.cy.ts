import { InvitationPage } from '~e2e-pages/index'
import { setupFeatureFlags } from '../../../support/setupFeatureFlags'

describe('User invitation', () => {
  setupFeatureFlags({
    registration: true,
    user_type: true,
    zipcode_at_register: true,
    captcha: true,
    turnstile_captcha: true,
    login_facebook: false,
    login_saml: false,
    login_cas: false,
    login_openid: false,
    login_franceconnect: false,
  })

  beforeEach(() => {
    cy.task('db:restore')
  })

  it('An expired invitation should redirect to homepage', () => {
    cy.visit('/invitation?token=sorryiamtheexpiredtoken')
    cy.url().should('eq', `${Cypress.config().baseUrl}/`)
    cy.get('.alert.alert-danger').contains('user-invitation-expired').should('exist').and('be.visible')
  })

  it('An invited user should be able to register', () => {
    cy.interceptGraphQLOperation({ operationName: 'UserInvitationPageAppQuery' })
    cy.visit('/invitation?token=oniiiichaaan')
    InvitationPage.fillInvitationForm()
  })

  it('An invited user should be able to register even with shield mode', () => {
    cy.setFeatureFlags({ shield_mode: true })
    cy.visit('/invitation?token=oniiiichaaan')
    InvitationPage.fillInvitationForm()
    cy.setFeatureFlags({ shield_mode: false }) // prevent impacting other tests
  })

  it('An invited user should be able to register even when registration is disabled', () => {
    cy.setFeatureFlags({ registration: false })
    cy.visit('/invitation?token=oniiiichaaan')
    InvitationPage.fillInvitationForm()
  })
})
