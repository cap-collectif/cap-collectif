import { Base } from 'cypress/pages/index'

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
    Base.visit({
      path: `project/budget-participatif-rennes/collect/collecte-des-propositions`,
      operationName: 'ProposalListViewRefetchQuery',
    })
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
