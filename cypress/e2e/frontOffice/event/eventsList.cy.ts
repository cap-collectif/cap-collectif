import { EventPage } from '~e2e/pages'
import { setupFeatureFlags } from '../../../support/setupFeatureFlags'

context('Events list filters as anonymous', () => {
  setupFeatureFlags({ themes: true, calendar: true })

  Cypress.on('uncaught:exception', err => {
    // returning false here prevents Cypress from failing the test
    if (err.message.includes('Failed to fetch')) {
      return false
    }
  })

  before(() => {
    cy.task('db:restore')
  })
  beforeEach(() => {
    cy.interceptGraphQLOperation({ operationName: 'EventListPageQuery' })
    cy.interceptGraphQLOperation({ operationName: 'EventRefetchRefetchQuery' })
    cy.visit('/events')
    cy.wait('@EventListPageQuery').its('response.statusCode').should('eq', 200)
    cy.isLoggedOut()
  })
  describe('within future events list', () => {
    it('should filter events by *title* and display correct results', () => {
      EventPage.typeInEventSearchInput('without')
      cy.wait('@EventRefetchRefetchQuery').its('response.statusCode').should('eq', 200)
      EventPage.waitForEventPreviewsToAppear()
      EventPage.checkEventPreviewCount(1)
      EventPage.checkEventPreviewContains(/Event without\s*registrations/)
    })
    it('should filter events by *theme* and display correct results', () => {
      EventPage.openFiltersMenu()
      EventPage.openSelectThemeDropdown()
      cy.get('.react-select__option').contains('Justice').click({ force: true })
      cy.wait('@EventRefetchRefetchQuery').its('response.statusCode').should('eq', 200)

      EventPage.getEventPreviews().and('have.length', 2)

      cy.get('.card__title').contains(/Event with\s*registrations/)
      cy.get('.card__title').should('not.contain.text', 'ParisWeb2015')
    })
  })
  describe('within archived events list', () => {
    it('should filter archived events by *title* and display correct results', () => {
      EventPage.filterArchivedEvents()
      cy.wait('@EventRefetchRefetchQuery').its('response.statusCode').should('eq', 200)

      EventPage.typeInEventSearchInput('ParisWeb2014')
      cy.wait('@EventRefetchRefetchQuery').its('response.statusCode').should('eq', 200)
      EventPage.getEventPreviews().and('have.length', 1)

      EventPage.checkEventPreviewContains(/ParisWeb.*/) // the text can be truncated so we're only trying to match the beginning
      cy.get('.card__title').should('not.contain.text', /^evenementPasseSansDate.*/) // the text can be truncated so we're only trying to match the beginning
    })
    it('should filter archived events by *theme* and display correct results', () => {
      EventPage.openFiltersMenu()
      EventPage.openSelectThemeDropdown()
      cy.get('.react-select__option').contains('Justice').click({ force: true })
      cy.wait('@EventRefetchRefetchQuery').its('response.statusCode').should('eq', 200)

      EventPage.filterArchivedEvents()
      cy.wait('@EventRefetchRefetchQuery').its('response.statusCode').should('eq', 200)
      EventPage.getEventPreviews().and('have.length', 1)

      EventPage.checkEventPreviewContains(/^evenementPasseSansDate.*/) // the text can be truncated so we're only trying to match the beginning
      cy.get('.card__title').should('not.contain.text', 'PHPTourDuFuture')
    })
  })
})

context('Events linked to a step as anonymous', () => {
  setupFeatureFlags({ calendar: true })

  before(() => cy.task('db:restore'))

  it('anonymous user can see events linked to a specific step', () => {
    cy.visit('/project/budget-participatif-idf/collect/collecte-des-projets-idf-privee')
    cy.isLoggedOut()
    EventPage.waitForEventPreviewsToAppear()
  })
})
