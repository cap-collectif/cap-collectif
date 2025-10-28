describe('Organization Invitation Redirects', () => {
  before(() => {
    cy.task('enable:feature', 'organizations')
  })

  it('should redirect to homepage with invalid token message when token is invalid', () => {
    cy.interceptGraphQLOperation({ operationName: 'NavBarMenuQuery' })
    cy.directLoginAs('user')
    cy.visit('/invitation/organization/token2')
    cy.wait('@NavBarMenuQuery', { timeout: 10000 })
    cy.url().should('eq', `${Cypress.config().baseUrl}/`)
    cy.get('div.alert').should('exist').and('be.visible').and('contain', 'invalid-token')
  })

  it('should redirect to projects page when token is valid for mauriau', () => {
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
    cy.wait('@LoginRequest', { timeout: 10000 })

    cy.visit('/invitation/organization/token2')
    cy.url().should('include', '/admin-next/projects')
  })
})
