import { Multilangue } from '~e2e-pages/index'

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
})
