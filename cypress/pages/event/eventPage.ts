type VisitOptions = {
  event: string
}

export default new (class EventPage {
  get cy() {
    return cy
  }

  get quickActionButton() {
    return this.cy.get('.cap-buttonQuickAction')
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
