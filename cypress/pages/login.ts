export default new (class Login {
  get cy() {
    return cy
  }

  openLoginModal() {
    this.cy.get('#login-button').click({ force: true })
  }

  fillCredentials(username: string, password: string) {
    this.cy.get('[name="username"]').clear().type(username)
    this.cy.get('[name="password"]').clear().type(password)
  }

  submitLogin() {
    this.cy.contains('button', 'global.login_me').click({ force: true })
  }

  clickOnForgetPassword() {
    this.cy.interceptGraphQLOperation({ operationName: 'NavbarRightQuery' })
    this.cy.contains('a', 'global.forgot_password').click({ force: true })
    this.cy.wait('@NavbarRightQuery', { timeout: 10000 })
  }
})()
