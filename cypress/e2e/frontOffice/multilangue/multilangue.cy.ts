import { Base, Multilangue } from '~e2e-pages/index'
import { setupFeatureFlags } from '../../../support/setupFeatureFlags'

describe('Multilangue', () => {
  setupFeatureFlags({ multilangue: true })

  const acceptCookiesIfBannerIsVisible = () => {
    cy.get('body').then($body => {
      if ($body.find('#cookie-consent').length) {
        cy.get('#cookie-consent').click({ force: true })
      }
    })
  }

  // Profile scenarios persist the user's locale; restore it before each test and retry.
  beforeEach(() => {
    cy.task('db:restore')
  })
  ;['/en/', '/en/projects'].forEach(path => {
    /**
     * @cypress-status compliant
     * @cypress-reason Checks both Symfony and Next localized routes with the feature disabled.
     */
    it(`rejects the localized route ${path} when multilingual support is disabled`, () => {
      cy.setFeatureFlags({ multilangue: false })
      cy.request({ url: path, failOnStatusCode: false }).its('status').should('eq', 404)
      cy.visit(path, { failOnStatusCode: false })
      cy.get('.error-page').should('be.visible')
      cy.get('.error-page__back-home').should('be.visible')
    })
  })

  /**
   * @cypress-status compliant
   * @cypress-reason Checks the localized projects route and its persisted language together.
   */
  it('lets the English projects URL override a previous French preference', () => {
    cy.setCookie('locale', 'fr-FR', { hostOnly: true })
    cy.visit('/en/projects')
    cy.url().should('include', '/en/projects')
    cy.get('.cap-project-card').should('have.length.greaterThan', 0)
    cy.getCookie('locale').should('have.property', 'value', 'en-GB')
  })

  /**
   * @cypress-status compliant
   * @cypress-reason Checks locale propagation through a real navigation link between Symfony and Next.
   */
  it('keeps English when navigating from the homepage to the projects page', () => {
    Base.visitHomepage({ lang: 'en' })
    acceptCookiesIfBannerIsVisible()
    Multilangue.visitProjectsPage('en')
    cy.location('pathname').should('eq', '/en/projects')
    cy.get('.cap-project-card').should('have.length.greaterThan', 0)
    cy.getCookie('locale').should('have.property', 'value', 'en-GB')
  })

  /**
   * @cypress-status compliant
   * @cypress-reason Checks the language cookie survives authenticated back-office navigation.
   */
  it('keeps the selected language when an administrator opens the back office', () => {
    cy.directLoginAs('admin')
    Base.visitHomepage({ lang: 'en', operationName: 'NavBarMenuQuery' })
    cy.getCookie('locale').should('have.property', 'value', 'en-GB')
    Base.visit({ path: '/admin-next/projects', operationName: 'projectsQuery' })
    cy.location('pathname').should('eq', '/admin-next/projects')
    cy.getCookie('locale').should('have.property', 'value', 'en-GB')
  })

  /**
   * @cypress-status compliant
   * @cypress-reason Checks the homepage route overrides a stale cookie and normalizes the English URL.
   */
  it('uses the default homepage locale and canonicalizes the explicit English prefix', () => {
    cy.setCookie('locale', 'en-GB', { hostOnly: true })
    Base.visitHomepage()
    cy.getCookie('locale').should('have.property', 'value', 'fr-FR')
    Base.visit({ path: '/en', operationName: 'NavbarRightQuery' })
    cy.location('pathname').should('eq', '/en/')
    cy.getCookie('locale').should('have.property', 'value', 'en-GB')
  })

  it('should show the locale selection banner only once after selecting a language from the header', () => {
    cy.intercept('POST', '**/api/change-locale/fr-FR').as('ChangeLocaleToFr')
    Base.visitHomepage({ lang: 'de' })
    acceptCookiesIfBannerIsVisible()
    cy.getCookie('locale').should('have.property', 'value', 'de-DE')
    cy.get('#changeLanguageProposalContainer').should('be.visible')
    cy.get('#language-change-button-dropdown').click({ force: true })
    cy.get('#language-choice-fr-FR').click({ force: true })
    cy.get('#language-header-continue-button').click({ force: true })
    cy.wait('@ChangeLocaleToFr')
    cy.wait('@NavbarRightQuery')
    cy.document().its('cookie').should('include', 'locale=fr-FR')
    cy.get('#changeLanguageProposalContainer').should('not.exist')
    Base.reload({ operationName: 'NavbarRightQuery' })
    cy.get('#changeLanguageProposalContainer').should('not.exist')
  })

  it('should not show the locale selection banner again after dismissing it', () => {
    Base.visitHomepage({ lang: 'de' })
    acceptCookiesIfBannerIsVisible()
    cy.getCookie('locale').should('have.property', 'value', 'de-DE')
    cy.get('#changeLanguageProposalContainer').should('be.visible')
    cy.get('#language-header-close').click({ force: true })
    Base.reload({ operationName: 'NavbarRightQuery' })
    cy.getCookie('locale').should('exist')
    cy.get('#changeLanguageProposalContainer').should('not.exist')
  })

  it('should show the locale selection banner again on other non-localized pages after a previous dismissal', () => {
    Base.visitHomepage({ lang: 'de' })
    acceptCookiesIfBannerIsVisible()
    cy.contains('error.404.title').should('not.exist')
    cy.getCookie('locale').should('have.property', 'value', 'de-DE')
    cy.get('#changeLanguageProposalContainer').should('be.visible')
    cy.get('#language-header-close').click({ force: true })
    Base.reload({ operationName: 'NavbarRightQuery' })
    cy.getCookie('locale').should('exist')
    cy.get('#changeLanguageProposalContainer').should('not.exist')

    Base.visitHomepage({ lang: 'en' })
    cy.get('#changeLanguageProposalContainer').should('be.visible')
    cy.getCookie('locale').should('exist')
  })

  it('should allow an anonymous user to change the locale via the footer', () => {
    Base.visitHomepage()
    cy.get('.footer-links').should('exist')
    cy.getCookie('locale').should('exist')
    cy.get('.footer-links').contains('french').should('exist')

    cy.get('#projects .cap-project-card').should('exist')
    cy.get('#proposals .row .card__title').should('exist')
    cy.scrollTo('bottom')
    cy.get('#cookie-consent').click({ force: true }) // Otherwise the footer is hidden and fail test
    cy.get('#language-change-button-dropdown').click({ force: true })
    cy.get('#language-choice-de-DE').click({ force: true })
    cy.wait('@NavbarRightQuery')
    cy.document().its('cookie').should('include', 'locale=de-DE')
  })

  it('should allow a logged-in user to change the locale from the profile page', () => {
    cy.setFeatureFlags({ profiles: true })
    Base.visitHomepage()
    cy.setCookie('hasFullConsent', 'true')
    cy.directLoginAs('user')

    Base.visit({ path: 'profile/edit-profile#account', operationName: 'NavBarMenuQuery' })

    cy.getCookie('locale').should('exist')
    cy.get('#display__language').should('exist')
    cy.get('.react-select__value-container').click({ force: true })
    cy.get('#display__language-menuList').should('exist')
    cy.get('#react-select-2-option-0').click({ force: true })
    cy.get('#edit-account-profile-button').click({ force: true })
    cy.wait('@NavBarMenuQuery')
    cy.getCookie('locale').should('have.property', 'value', 'de-DE')
  })

  it('should correctly change locale via footer on routes with parameters', () => {
    Base.visit({
      path: `project/budget-participatif-rennes/collect/collecte-des-propositions`,
      operationName: 'ProposalListViewRefetchQuery',
    })
    cy.get('.footer-links').should('exist')
    cy.getCookie('locale').should('exist')
    cy.get('.footer-links').contains('french').should('exist')

    cy.get('.proposal__step-page .body__infos__content').should('exist')
    cy.scrollTo('bottom')
    cy.get('#cookie-consent').click({ force: true }) // Otherwise the footer is hidden and fail test
    cy.get('#language-change-button-dropdown').click({ force: true })
    cy.get('#language-choice-de-DE').click({ force: true })
    cy.wait('@ProposalListViewRefetchQuery')
    cy.getCookie('locale').should('have.property', 'value', 'de-DE')
  })
})
