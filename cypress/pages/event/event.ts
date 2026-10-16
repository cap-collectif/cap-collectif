export default new (class Event {
  get cy() {
    return cy
  }

  openRegistrationModal() {
    this.cy.contains('global.register').should('exist').and('be.visible').click()
  }
  fillRegistration() {
    this.cy.get('#EventFormAnonymousModal-username').should('exist').and('be.visible').type('Naruto42')
    this.cy.get('#EventFormAnonymousModal-email').should('exist').and('be.visible').type('naruto42@gmail.com')
    // The custom form component hides the native checkbox; force is required to check it.
    this.cy.get('#EventFormAnonymousModal-accept').should('exist').check({ force: true })
    this.cy.get('.cap-modal').contains('global.register').should('exist').and('be.visible').click()
  }
})()
