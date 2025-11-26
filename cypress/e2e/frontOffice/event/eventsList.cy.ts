import { EventPage } from '~e2e/pages'

context('Events list page', () => {
  describe('As admin', () => {
    beforeEach(() => {
      cy.task('db:restore')
      cy.directLoginAs('admin')
      cy.task('enable:feature', 'themes')
      cy.task('enable:feature', 'calendar')
      cy.visit('/events')
      Cypress.on('uncaught:exception', (err, runnable) => {
        // returning false here prevents Cypress from failing the test
        return false
      })
    })
    context('within future events list', () => {
      it('should filter events by *title* and display correct results', () => {
        EventPage.typeInEventSearchInput('without')
        EventPage.waitForEventPreviewsToAppear()
        EventPage.checkEventPreviewCount(1)
        EventPage.checkEventPreviewContains(/Event without\s*registrations/)
      })
      it('should filter events by *theme* and display correct results', () => {
        cy.task('enable:feature', 'themes')

        EventPage.openFiltersMenu()
        EventPage.openSelectThemeDropdown()
        cy.get('.react-select__option').contains('Justice').click()

        EventPage.getEventPreviews().and('have.length', 2)

        cy.get('.card__title').contains(/Event with\s*registrations/, { timeout: 5000 })
        cy.get('.card__title').should('not.contain.text', 'ParisWeb2015')
      })
    })
    context('within archived events list', () => {
      it('should filter archived events by *title* and display correct results', () => {
        EventPage.openEventStatusFilter()
        EventPage.filterArchivedEvents()

        EventPage.typeInEventSearchInput('ParisWeb2014')

        cy.get('.loader').should('exist').and('be.visible', { timeout: 10000 })
        EventPage.getEventPreviews().and('have.length', 1)

        EventPage.checkEventPreviewContains(/ParisWeb.*/) // the text can be truncated so we're only trying to match the beginning
        cy.get('.card__title').should('not.contain.text', /^evenementPasseSansDate.*/) // the text can be truncated so we're only trying to match the beginning
      })
      it('should filter archived events by *theme* and display correct results', () => {
        cy.task('enable:feature', 'themes')

        EventPage.openFiltersMenu()
        EventPage.openSelectThemeDropdown()
        cy.get('.react-select__option').contains('Justice').click()

        EventPage.openEventStatusFilter()
        EventPage.filterArchivedEvents()

        cy.get('.loader').should('exist').and('be.visible', { timeout: 10000 })
        EventPage.getEventPreviews().and('have.length', 1)

        EventPage.checkEventPreviewContains(/^evenementPasseSansDate.*/) // the text can be truncated so we're only trying to match the beginning
        cy.get('.card__title').should('not.contain.text', 'PHPTourDuFuture')
      })
    })
  })

  describe('As anonymous', () => {
    it('anonymous user can see events linked to a specific step', () => {
      cy.task('enable:feature', 'calendar')
      cy.visit('/project/budget-participatif-idf/collect/collecte-des-projets-idf-privee')
      EventPage.waitForEventPreviewsToAppear()
    })
  })
})
