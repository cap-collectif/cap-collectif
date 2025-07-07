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

  openFiltersMenu() {
    return this.cy.get('#event-button-filter').click()
  }

  openEventStatusFilter() {
    return this.cy.get('#event-status-filter-button-desktop').click()
  }

  filterArchivedEvents() {
    this.openEventStatusFilter()
    cy.get('input[type="radio"][id="finished-events"]').check({ force: true })
  }

  openSelectThemeDropdown() {
    return this.cy.get('#SelectTheme-filter-theme').click()
  }

  getEventSearchInput() {
    return this.cy.get('input#event-search-input')
  }

  typeInEventSearchInput(value: string) {
    return this.getEventSearchInput().clear().type(value)
  }

  getEventPreviews() {
    // TODO: decrease timeout when the page is migrated and the performance is improved. Currently failing on CI despite the long timeout.
    return this.cy.get('.eventPreview', { timeout: 30000 }).should('exist').and('be.visible')
  }

  waitForEventPreviewsToAppear() {
    return this.getEventPreviews().and('have.length.greaterThan', 0)
  }

  checkEventPreviewCount(count: number) {
    return this.getEventPreviews().should('have.length', count)
  }

  checkEventPreviewContains(text: string | RegExp) {
    if (typeof text === 'string') {
      return this.cy.get('.card__title').should('contain.text', text)
    }
    return this.cy.get('.card__title').contains(text, { timeout: 10000 })
  }
})()
