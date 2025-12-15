import { Base } from '~e2e-pages/index'

describe('Organization Invitation Redirects', () => {
  before(() => {
    cy.task('enable:feature', 'organizations')
  })
  beforeEach(() => {
    cy.task('db:restore')
  })

  it('should redirect to homepage with invalid token message when token is invalid', () => {
    cy.directLoginAs('user')
    Base.visit({ path: '/invitation/organization/token2', operationName: 'NavBarMenuQuery' })

    cy.url().should('eq', `${Cypress.config().baseUrl}/`)
    cy.get('div.alert').should('exist').and('be.visible').and('contain', 'invalid-token')
  })

  it('should redirect to projects page when token is valid', () => {
    // login as mauriau to use their invitation token
    cy.intercept('POST', '/login_check').as('LoginRequest')
    cy.url().then(url => {
      if (url === 'about:blank') {
        cy.visit('/')
      }
    })
    cy.contains('global.login').click()
    const email = 'maxime.auriau@cap-collectif.com'
    const password = 'toto'

    cy.get('#login-form').within(() => {
      cy.get('input[name="username"]').type(email, { force: true })
      cy.get('input[name="password"]').type(password, { force: true })
      cy.root().submit()
    })
    cy.wait('@LoginRequest')
    cy.visit('/invitation/organization/token2')
    cy.url().should('include', '/admin-next/projects')
  })
})
