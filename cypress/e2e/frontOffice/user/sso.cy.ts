describe('SSO', () => {
  before(() => {
    cy.task('db:restore')
    cy.task('enable:feature', 'oauth2_switch_user')
    cy.task('enable:feature', 'sso_by_pass_auth')
    cy.task('enable:feature', 'login_openid')
    cy.task('run:sql', 'UPDATE sso_configuration SET enabled = 1 WHERE id = "ssoOauth2"')
  })

  after(() => {
    cy.task('disable:feature', 'oauth2_switch_user')
    cy.task('disable:feature', 'sso_by_pass_auth')
    cy.task('disable:feature', 'login_openid')
    cy.task('run:sql', 'UPDATE sso_configuration SET enabled = 0 WHERE id = "ssoOauth2"')
  })

  it('allows an OpenID user to soft delete their account', () => {
    cy.visit('/404.html')

    cy.intercept({
      method: 'POST',
      pathname: '/graphql/internal',
      query: { operation: 'EditProfileBoxQuery' },
    }).as('editProfileBoxQuery')

    cy.visit('https://capco.test/login/openid?_destination=https://capco.test/')

    return cy
      .location('pathname')
      .should('match', /^\/realms\/master\/protocol\/openid-connect\/auth/i)
      .then(() => cy.url())
      .then(url => {
        const openIdOrigin = new URL(url).origin

        return cy.origin(
          openIdOrigin,
          {
            args: {
              username: Cypress.env('SYMFONY_OPENID_TEST_USERNAME') || 'test',
              password: Cypress.env('SYMFONY_OPENID_TEST_PASSWORD') || 'test',
            },
          },
          ({ username, password }) => {
            cy.get('input[name="username"]').should('be.visible').type(username)
            cy.get('input[name="password"]').should('be.visible').type(password)
            cy.get('#kc-login').should('be.visible').click()
          },
        )
      })
      .then(() => {
        cy.location('pathname').should('eq', '/')
        cy.getCookie('PHPSESSID').should('exist')
        cy.visit('/profile/edit-profile#account')

        cy.wait('@editProfileBoxQuery').then(({ response }) => {
          expect(response?.statusCode).to.eq(200)
          expect(response?.body?.errors, JSON.stringify(response?.body)).to.be.undefined
          expect(response?.body?.data?.viewer, JSON.stringify(response?.body)).to.not.be.null
        })

        cy.get('#account-tabs').should('be.visible')
        cy.get('#account-tabs-tab-account').should('exist').and('be.visible').click()
        cy.get('#delete-account-profile-button').should('exist').and('be.visible').click()
        cy.get('#confirm-delete-form-submit').should('exist').and('be.visible').click()

        cy.location('pathname').should('eq', '/')
      })
  })
})
