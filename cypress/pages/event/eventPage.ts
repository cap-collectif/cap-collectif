type VisitOptions = {
  event: string
}

export default new (class EventPage {
  get cy() {
    return cy
  }

  get quickActionButton() {
    this.cy.wait(1000)
    return this.cy.get('.cap-buttonQuickAction')
  }

  get downloadAction() {
    this.cy.wait(1000)
    return this.cy.get('#download-event-registration')
  }

  visit({ event }: VisitOptions) {
    this.cy.interceptGraphQLOperation({ operationName: 'EventPageQuery' })
    this.cy.visit(`/events/${event}`)
    return this.cy.wait('@EventPageQuery')
  }

  visitEventApprovedWithRegistration() {
    return this.visit({
      event: 'event-Create-By-user-with-review-approved',
    })
  }
})()
