import { Base } from '~e2e-pages/index'

describe('Developer page', () => {
  before(() => {
    cy.task('enable:feature', 'developer_documentation')
  })
  beforeEach(() => {
    cy.task('db:restore')
  })

  // ------------------ Developer page access as anonymous ------------------
  it('visits the developer page', () => {
    Base.visit({ path: '/developer', operationName: 'NavbarRightQuery' })
    cy.contains('Cap Collectif Developers').should('be.visible')
  })

  it('visits a category in the developer page', () => {
    Base.visit({ path: '/developer/query', operationName: 'NavbarRightQuery' })
    cy.contains('defines GraphQL operations that retrieve data from the server.').should('be.visible')
  })

  it('visits a type in the developer page', () => {
    Base.visit({ path: '/developer/object/Consultation', operationName: 'NavbarRightQuery' })
    cy.contains('A consultation').should('be.visible')
  })

  it('visits an unknown type in the developer page', () => {
    Base.visit({ path: '/developer/object/Unknown', operationName: 'NavbarRightQuery', failOnStatusCode: false })
    cy.contains('error.404.title').should('be.visible')
  })

  it('visits the developer guides page', () => {
    Base.visit({ path: '/developer/guides', operationName: 'NavbarRightQuery' })
    cy.contains('API Guides').should('be.visible')
  })

  it('visits a guide about questionnaires', () => {
    Base.visit({ path: '/developer/guides/questionnaires', operationName: 'NavbarRightQuery' })
    cy.contains('Look up responses to a questionnaire').should('be.visible')
  })

  it('visits an unknown guide in the developer page', () => {
    Base.visit({ path: '/developer/guides/Unknown', operationName: 'NavbarRightQuery', failOnStatusCode: false })
    cy.contains('error.404.title').should('be.visible')
  })
})
