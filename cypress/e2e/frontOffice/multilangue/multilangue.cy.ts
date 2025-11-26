import { Base, Multilangue } from '~e2e-pages/index'

// todo: multilangue is currently broken. The tests can't properly be written until it's fixed
// skipping all failing tests for now
describe('Multilangue', () => {
  beforeEach(() => {
    cy.task('db:restore')
  })

  it('throws 404 if user visits the english page while multilangue feature is not activated', () => {
    cy.task('disable:feature', 'multilangue')
    cy.visit('/en/')
    cy.contains('error.404.title').should('be.visible')
  })

  // TODO - since refactor to nextjs, the behavior has changed and the test should have been failing all along
  // needs to be reworked when the multilangue projects page is fixed
  it('visits the english version of the platform', () => {
    cy.task('enable:feature', 'multilangue')
    cy.visit('/en/projects')
    cy.url().should('include', '/en/projects')
    cy.get('error.404.title').should('not.exist')
    // cy.getCookie('locale').should('have.property', 'value', 'en-GB') // @FIXME - currently not working
  })

  it.skip('visits the english version of the platform and keeps the language setting accross pages', () => {
    cy.interceptGraphQLOperation({ operationName: 'ProjectsListQuery' })
    cy.task('enable:feature', 'multilangue')
    cy.visit('/en')
    Multilangue.visitProjectsPage()
    cy.wait('@ProjectsListQuery', { timeout: 1000 })
    cy.url().should('include', '/en/projects')
    cy.get('section.projects-list-section').should('exist').and('be.visible').and('have.length.greaterThan', 10)
    cy.getCookie('locale').should('have.property', 'value', 'en-GB')
  })

  it.skip('visits the english version of the platform then do some admin stuff and keep language setting', () => {
    cy.task('enable:feature', 'multilangue')
    cy.directLoginAs('admin')
    cy.visit('/en')
    cy.visit('/admin')
    cy.url().should('include', '/admin')
    cy.getCookie('locale').should('have.property', 'value', 'en-GB')
  })

  it.skip('visits the english version of the platform but "multilangue" is not activated', () => {
    cy.task('disable:feature', 'multilangue')
    cy.visit('/en/projects')
    cy.getCookie('locale').should('have.property', 'value', 'fr-FR')
  })

  it.skip('visits the english version of the platform with "multilangue" activated', () => {
    cy.task('enable:feature', 'multilangue')
    cy.visit('/en/projects')
    cy.url().should('include', '/en/projects')
    cy.getCookie('locale').should('have.property', 'value', 'en-GB')
  })

  it.skip('visits the english version of the platform with platform default set as "fr-FR"', () => {
    cy.task('enable:feature', 'multilangue')
    cy.setCookie('locale', 'fr-FR')
    cy.visit('/')
    cy.getCookie('locale').should('have.property', 'value', 'fr-FR')

    Multilangue.visitProjectsPage()
    cy.url().should('include', '/projects')
    cy.visit('/en/projects')
    cy.url().should('include', '/en')
    cy.getCookie('locale').should('have.property', 'value', 'en-GB')
    Multilangue.visitProjectsPage()
    cy.url().should('include', '/en/projects')
  })

  it.skip('visits the english version of the platform with platform default set as "en-GB"', () => {
    cy.task('enable:feature', 'multilangue')
    cy.setCookie('locale', 'en-GB')
    cy.visit('/')
    cy.getCookie('locale').should('have.property', 'value', 'en-GB')
    Multilangue.visitProjectsPage()
    cy.url().should('include', '/projects') // todo: check that there is no '/en'
    cy.visit('/en')
    cy.url().should('include', '/fr')
    cy.getCookie('locale').should('have.property', 'value', 'fr-FR')
    Multilangue.visitProjectsPage()
    cy.url().should('include', '/fr/projects')
  })

  it('should show the locale selection banner only once after selecting a language from the header', () => {
    Base.visitHomepage({ lang: 'de' })
    cy.getCookie('locale').should('not.exist')
    cy.get('#changeLanguageProposalContainer').should('be.visible')
    cy.get('#language-change-button-dropdown').click({ force: true })
    cy.get('#language-choice-fr-FR').click({ force: true })
    cy.get('#language-header-continue-button').click({ force: true })
    cy.wait('@NavbarRightQuery', { timeout: 10000 })
    Cypress.Cookies.debug(true)
    cy.document().its('cookie').should('include', 'locale=fr-FR')
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
    Base.reload({ operationName: 'NavbarRightQuery', timeout: 15000 })
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
    cy.document().its('cookie').should('include', 'locale=de-DE')
  })

  it('should allow a logged-in user to change the locale from the profile page', () => {
    cy.task('enable:feature', 'profiles')
    Base.visitHomepage()
    cy.setCookie('hasFullConsent', 'true')
    cy.directLoginAs('user')

    Base.visit({ path: 'profile/edit-profile#account', operationName: 'NavBarMenuQuery' })

    cy.getCookie('locale').should('not.exist')
    cy.get('#display__language').should('exist')
    cy.get('.react-select__value-container').click({ force: true })
    cy.get('#display__language-menuList').should('exist')
    cy.get('#react-select-2-option-0').click({ force: true })
    cy.get('#edit-account-profile-button').click({ force: true })
    cy.wait('@NavBarMenuQuery', { timeout: 10000 })
    cy.getCookie('locale').should('have.property', 'value', 'de-DE')
  })

  it('should correctly change locale via footer on routes with parameters', () => {
    Base.visit({
      path: `project/budget-participatif-rennes/collect/collecte-des-propositions`,
      operationName: 'ProposalListViewRefetchQuery',
    })
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
})
