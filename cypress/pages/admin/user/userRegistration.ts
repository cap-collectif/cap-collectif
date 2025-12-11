export default new (class UserRegistration {
  get cy() {
    return cy
  }

  clickRegistrationButton() {
    cy.get('#registration-button', { timeout: 20000 }).should('exist').and('be.visible').click({ force: true })
  }

  consentToCookies() {
    cy.get('#cookie-consent').click({ force: true })
  }

  confirmRegister() {
    cy.interceptGraphQLOperation({ operationName: 'RegisterMutation' })
    cy.get('[name=charte]').check({ force: true })

    cy.get('#confirm-login').click({ force: true })
    cy.wait('@RegisterMutation', { timeout: 10000 })
    cy.get('.cap-modal__body').scrollTo('bottom')

    cy.get('#email-confirmation-help-message', { timeout: 20000 }).should('exist') // todo: check that the element is visible (`and('be.visible')`), scroll above seems to not be working at the moment
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
