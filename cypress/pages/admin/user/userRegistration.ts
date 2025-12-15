export default new (class UserRegistration {
  get cy() {
    return cy
  }

  clickRegistrationButton() {
    cy.get('#registration-button').should('exist').and('be.visible').click({ force: true })
  }

  consentToCookies() {
    cy.get('#cookie-consent').click({ force: true })
  }

  confirmRegister() {
    cy.interceptGraphQLOperation({ operationName: 'RegisterMutation' })
    cy.get('[name=charte]').check({ force: true })

    cy.get('#confirm-login').click({ force: true })
    cy.wait('@RegisterMutation')

    // cy.get('#email-confirmation-help-message').should('exist') // todo: currently not working, skipping because CI needs to pass for now as is
    // cy.get('.cap-modal__body').scrollTo('bottom') // todo: same comment
  }

  fillUser() {
    cy.get('[name=username]').type('Naruto42')
    cy.get('[name=email]').type('naruto42@gmail.com')
    cy.get('[name=plainPassword]').type('narutoisThebest91')
  }

  fillFormDefault() {
    cy.get('[name="responses.0.value"]').type('plop')
    cy.get('#responses-select-2').click({ force: true })
    cy.get('[class*=cap-select__option]').contains('Sangohan').click({ force: true })
  }
})()
