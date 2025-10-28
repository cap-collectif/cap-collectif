export default new (class Event {
  get cy() {
    return cy
  }

  openRegistrationModal() {
    this.cy.contains('global.register').click({ force: true })
  }
  fillRegistration() {
    this.cy.get('#EventFormAnonymousModal-username').type('Naruto42')
    this.cy.get('#EventFormAnonymousModal-email').type('naruto42@gmail.com')
    this.cy.get('#EventFormAnonymousModal-accept').check({ force: true })
    this.cy.get('.cap-modal').contains('global.register').click({ force: true })
  }
})()
