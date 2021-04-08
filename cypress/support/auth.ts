Cypress.Commands.add('login', ({ email, password }: Cypress.LoginOptions) => {
  cy.intercept('POST', '/login_check').as('LoginRequest')
  cy.url().then(url => {
    if (url === 'about:blank') {
      cy.visit('/')
    }
  })
  cy.contains('global.login').click()
  const log = Cypress.log({
    name: 'login',
    displayName: 'LOGIN',
    message: [`🔐 Authenticating | ${email}`],
    autoEnd: false,
  })

  cy.get('#login-form').within(() => {
    cy.get('input[name="username"]').type(email, { force: true })
    cy.get('input[name="password"]').type(password, { force: true })
    log.snapshot('before')
    cy.root().submit()
  })
  return cy.wait('@LoginRequest').then(() => {
    log.set({
      consoleProps() {
        return {
          email,
          password,
        }
      },
    })

    log.snapshot('after')
    log.end()
  })
})

Cypress.Commands.add('loginAs', (email: Cypress.LoginAsUsernames) => {
  switch (email) {
    case 'admin':
      return cy.login({
        email: 'admin@test.com',
        password: 'admin',
      })
    case 'super_admin':
      return cy.login({
        email: 'lbrunet@cap-collectif.com',
        password: 'toto',
      })
    case 'user':
      return cy.login({
        email: 'user@test.com',
        password: 'user',
      })
    default:
      throw new Error(`Unsupported email: ${email}`)
  }
})
