const LoginAsData = (email: string) => {
  switch (email) {
    case 'admin':
      return {
        email: 'admin@test.com',
        password: 'admin',
      }
    case 'super_admin':
      return {
        email: 'lbrunet@cap-collectif.com',
        password: 'toto',
      }
    case 'project_owner':
      return {
        email: 'theo@cap-collectif.com',
        password: 'toto',
      }
    case 'user':
      return {
        email: 'user@test.com',
        password: 'user',
      }
    case 'pierre':
      return {
        email: 'pierre@cap-collectif.com',
        password: 'toto',
      }
    case 'user_not_confirmed':
      return {
        email: 'user_not_confirmed@test.com',
        password: 'user_not_confirmed',
      }
    default:
      throw new Error(`Unsupported email: ${email}`)
  }
}

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
  return cy.login(LoginAsData(email))
})

Cypress.Commands.add('directLogin', ({ email, password }: Cypress.LoginOptions) => {
  cy.session([email, password], () => {
    cy.url().then(url => {
      if (url === 'about:blank') {
        cy.visit('/')
      }
    })

    const log = Cypress.log({
      name: 'login',
      displayName: 'LOGIN',
      message: [`🔐 Authenticating | ${email}`],
      autoEnd: false,
    })

    cy.request('POST', '/login_check', { username: email, password }).then(response => {
      expect(response.status).to.eq(200)
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
    cy.getCookie('PHPSESSID').should('exist')
  })
})

Cypress.Commands.add('directLoginAs', (email: Cypress.LoginAsUsernames) => {
  return cy.directLogin(LoginAsData(email))
})
