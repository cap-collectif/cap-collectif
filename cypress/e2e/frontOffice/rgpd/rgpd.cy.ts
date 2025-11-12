import { Base, RGPDPage } from 'cypress/pages/index'

describe('rgpd', () => {
  beforeEach(() => {
    cy.interceptGraphQLOperation({ operationName: 'NavbarRightQuery' })
  })

  it('should toggle cookies performance', () => {
    Base.visitHomepage()
    cy.get('#cookies-management').click({ force: true })
    cy.contains('global.disabled')
    cy.get('#cookies-enable-analytic').click({ force: true })
    cy.contains('list.label_enabled')
    cy.get('#cookies-save').click({ force: true })
    cy.contains('cookies.content.page').should('not.be.visible')
    cy.getCookie('analyticConsentValue').should('have.property', 'value', 'true')
  })
  it('should toggle cookies advertising', () => {
    Base.visitHomepage()
    cy.get('#cookies-management').click({ force: true })
    cy.contains('global.disabled')
    cy.get('#cookies-enable-ads').click({ force: true })
    cy.contains('list.label_enabled')
    cy.get('#cookies-save').click({ force: true })
    cy.contains('cookies.content.page').should('not.be.visible')
    cy.getCookie('adCookieConsentValue').should('have.property', 'value', 'true')
  })
})

describe('RGPD - Gestion des cookies', () => {
  beforeEach(() => {
    cy.clearCookies()
    cy.interceptGraphQLOperation({ operationName: 'NavbarRightQuery' })
  })

  it('should allow an anonymous user to accept cookies and load the associated cookie', () => {
    Base.visitHomepage()
    cy.getCookie('hasFullConsent').should('not.exist')
    cy.get('#cookie-banner').should('be.visible')
    cy.get('#cookie-consent').click({ force: true })
    Base.reload({ operationName: 'NavbarRightQuery' })
    cy.get('#cookie-banner').should('not.be.visible')
    cy.getCookie('hasFullConsent').should('exist')
  })

  it('should not accept cookies when an anonymous user clicks elsewhere on the page', () => {
    Base.visitHomepage()
    cy.get('#cookie-banner').should('be.visible')
    cy.get('h1').click({ force: true })
    cy.get('#cookie-banner').should('be.visible')
  })

  it('should not accept cookies when an anonymous user scrolls the page', () => {
    RGPDPage.visitProject()
    cy.get('#cookie-banner').should('be.visible')
    cy.scrollTo('bottom')
    cy.get('#cookie-banner').should('be.visible')
  })

  it('should allow an anonymous user to refuse all cookies', () => {
    Base.visitHomepage()
    cy.get('#cookie-banner').should('be.visible')
    cy.get('#cookie-decline-button').click({ force: true })
    Base.reload({ operationName: 'NavbarRightQuery' })
    cy.get('#cookie-banner').should('not.be.visible')
    cy.getCookie('hasFullConsent').should('exist')
  })

  it('should create a cookie when an anonymous user accepts cookies', () => {
    Base.visitHomepage()

    cy.getCookie('hasFullConsent').should('not.exist')
    cy.get('#cookie-banner').should('be.visible')
    cy.get('#cookie-consent').click({ force: true })
    Base.reload({ operationName: 'NavbarRightQuery' })
    cy.get('#cookie-banner').should('not.be.visible')
    cy.getCookie('hasFullConsent').should('exist')
  })

  it('should toggle cookies when a user revokes consent after accepting', () => {
    Base.visitHomepage()
    cy.getCookie('hasFullConsent').should('not.exist')
    cy.get('#cookie-banner').should('be.visible')
    cy.get('#cookie-consent').click({ force: true })

    cy.get('#cookie-banner').should('not.be.visible')
    cy.getCookie('hasFullConsent').should('exist')

    cy.get('#cookies-management').click({ force: true })
    cy.get('#cookies-enable-analytic').click({ force: true })
    cy.get('#cookies-save').click({ force: true })
    cy.getCookie('hasFullConsent').should('have.property', 'value', 'false')
  })

  it('should allow an anonymous user to visit the privacy policy page without error', () => {
    Base.visit({ path: 'privacy', operationName: 'NavbarRightQuery' })
    cy.contains('error.500').should('not.exist')
  })

  it('should allow an anonymous user to visit the legal notice page without error', () => {
    Base.visit({ path: 'legal', operationName: 'NavbarRightQuery' })
    cy.contains('error.500').should('not.exist')
  })
})

describe('Multilangue - gestion de la locale', () => {
  beforeEach(() => {
    cy.clearCookies()
    cy.task('enable:feature', 'multilangue')
    cy.interceptGraphQLOperation({ operationName: 'NavbarRightQuery' })
  })

  it('should show the locale selection banner only once after selecting a language from the header', () => {
    Base.visitHomepage({ lang: 'de' })
    cy.getCookie('locale').should('not.exist')
    cy.get('#changeLanguageProposalContainer').should('be.visible')
    cy.get('#language-change-button-dropdown').click({ force: true })
    cy.get('#language-choice-fr-FR').click({ force: true })
    cy.get('#language-header-continue-button').click({ force: true })
    cy.wait('@NavbarRightQuery', { timeout: 10000 })
    cy.getCookie('locale').should('have.property', 'value', 'fr-FR')
  })

  it('should not show the locale selection banner again after dismissing it', () => {
    Base.visitHomepage({ lang: 'de' })
    cy.getCookie('locale').should('not.exist')
    cy.get('#changeLanguageProposalContainer').should('be.visible')
    cy.get('#language-header-close').click({ force: true })
    Base.reload({ operationName: 'NavbarRightQuery' })
    cy.getCookie('locale').should('exist')
    cy.get('#changeLanguageProposalContainer').should('not.exist')
  })

  it('should show the locale selection banner again on other non-localized pages after a previous dismissal', () => {
    Base.visitHomepage({ lang: 'de' })
    cy.contains('error.404.title').should('not.exist')
    cy.getCookie('locale').should('not.exist')
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
    cy.getCookie('locale').should('not.exist')
    cy.get('.footer-links').contains('french').should('exist')

    cy.get('#projects .cap-project-card').should('exist')
    cy.get('#proposals .row .card__title').should('exist')
    cy.scrollTo('bottom')
    cy.get('#cookie-consent').click({ force: true }) // Otherwise the footer is hidden and fail test
    cy.get('#language-change-button-dropdown').click({ force: true })
    cy.get('#language-choice-de-DE').click({ force: true })
    cy.wait('@NavbarRightQuery', { timeout: 10000 })
    cy.getCookie('locale').should('have.property', 'value', 'de-DE')
  })

  it('should correctly change locale via footer on routes with parameters', () => {
    RGPDPage.visitProject()
    cy.get('.footer-links').should('exist')
    cy.getCookie('locale').should('not.exist')
    cy.get('.footer-links').contains('french').should('exist')

    cy.get('.proposal__step-page .body__infos__content').should('exist')
    cy.scrollTo('bottom')
    cy.get('#cookie-consent').click({ force: true }) // Otherwise the footer is hidden and fail test
    cy.get('#language-change-button-dropdown').click({ force: true })
    cy.get('#language-choice-de-DE').click({ force: true })
    cy.wait('@ProposalListViewRefetchQuery', { timeout: 10000 })
    cy.getCookie('locale').should('have.property', 'value', 'de-DE')
  })

  it('should allow a logged-in user to change the locale from the profile page', () => {
    cy.task('enable:feature', 'profiles')
    Base.visitHomepage()
    cy.setCookie('hasFullConsent', 'true')
    cy.directLoginAs('user')

    Base.visit({ path: 'profile/edit-profile#account', operationName: 'NavBarMenuQuery', withIntercept: true })

    cy.getCookie('locale').should('not.exist')
    cy.get('#display__language').should('exist')
    cy.get('.react-select__value-container').click({ force: true })
    cy.get('#display__language-menuList').should('exist')
    cy.get('#react-select-2-option-0').click({ force: true })
    cy.get('#edit-account-profile-button').click({ force: true })
    cy.wait('@NavBarMenuQuery')
    cy.getCookie('locale').should('have.property', 'value', 'de-DE')
  })
})
