describe('Direct login sessions', () => {
  before(() => {
    cy.task('db:restore')
  })

  beforeEach(() => {
    cy.then(() => Cypress.session.clearAllSavedSessions())
  })

  const expectSuperAdmin = () => {
    cy.request('POST', '/graphql/internal', { query: '{ viewer { email isSuperAdmin } }' })
      .its('body.data.viewer')
      .should('include', { email: 'lbrunet@cap-collectif.com', isSuperAdmin: true })
  }

  it('logs in without loading the homepage', () => {
    cy.intercept('GET', '/', { statusCode: 503, body: 'Homepage unavailable' }).as('homepage')
    cy.directLoginAs('super_admin')
    expectSuperAdmin()
    cy.get('@homepage.all').should('have.length', 0)
  })

  it('reuses a valid session for the requested user', () => {
    cy.directLoginAs('super_admin')
    cy.getCookie('PHPSESSID')
      .its('value')
      .then(sessionId => {
        cy.directLoginAs('super_admin')
        cy.getCookie('PHPSESSID').its('value').should('eq', sessionId)
      })
    expectSuperAdmin()
  })

  it('logs in again when the cached cookie no longer authenticates on the server', () => {
    cy.directLoginAs('super_admin')
    expectSuperAdmin()
    cy.request('/logout')
    cy.directLoginAs('super_admin')
    expectSuperAdmin()
  })
})
