export default new (class InvitationPage {
  get cy() {
    return cy
  }

  fillInvitationForm = () => {
    cy.interceptGraphQLOperation({ operationName: 'RegistrationButtonQuery' })
    cy.get('#responses\\.0\\.value').should('exist').and('be.visible')
    cy.get('input[name="plainPassword"]').type('RemChanDaiSki93160')
    cy.get('input[name="username"]').type('RemChanDaiSki')
    cy.get('div.cap-select').contains('registration.type').click({ force: true })
    cy.get('.cap-select__option').contains('Citoyen').click({ force: true })
    cy.get('input[name="zipcode"]').type('93160')
    cy.get('input[name="responses.0.value"]').type('plop')
    cy.get('div.cap-select').contains('admin.fields.menu_item.parent_empty').click({ force: true })
    cy.get('.cap-select__option').contains('Sangohan').click({ force: true })
    cy.get('input[name="charte"]').check({ force: true })
    cy.get('div[id^=turnstile_captcha-]').should('exist')
    cy.get('#confirm-register').click()
    cy.contains('registration.constraints.captcha.invalid').should('be.visible')
    cy.confirmCaptcha()
    cy.wait(500) // wait for captcha, cannot be intercepted
    cy.get('#confirm-register').click()
    cy.wait('@RegistrationButtonQuery', { timeout: 10000 })
    cy.url().should('eq', `${Cypress.config().baseUrl}/`)
    cy.get('#navbar-username').contains('RemChanDaiSki').should('exist').and('be.visible')
  }
})()
