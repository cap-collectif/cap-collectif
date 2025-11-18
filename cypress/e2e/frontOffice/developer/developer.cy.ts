import { Base } from '~e2e-pages/index'

describe('Developer', () => {
  before(() => {
    cy.task('db:restore')
    cy.task('disable:feature', 'shield_mode')
    cy.task('enable:feature', 'developer_documentation')
  })

  it('An anonymous user wants to visit the developer page', () => {
    Base.visit({ path: '/developer', operationName: 'NavbarRightQuery' })
    cy.contains('Cap Collectif Developers').should('be.visible')
  })

  it('An anonymous user wants to visit a category in the developer page', () => {
    Base.visit({ path: '/developer/query', operationName: 'NavbarRightQuery' })
    cy.contains('defines GraphQL operations that retrieve data from the server.').should('be.visible')
  })

  it('An anonymous user wants to visit a type in the developer page', () => {
    Base.visit({ path: '/developer/object/Consultation', operationName: 'NavbarRightQuery' })
    cy.contains('A consultation').should('be.visible')
  })

  it('An anonymous user wants to visit an unknown type in the developer page', () => {
    Base.visit({ path: '/developer/object/Unknown', operationName: 'NavbarRightQuery', failOnStatusCode: false })
    cy.contains('error.404.title').should('be.visible')
  })

  it('An anonymous user wants to visit the developer guides page', () => {
    Base.visit({ path: '/developer/guides', operationName: 'NavbarRightQuery' })
    cy.contains('API Guides').should('be.visible')
  })

  it('An anonymous user wants to visit a guide about questionnaires', () => {
    Base.visit({ path: '/developer/guides/questionnaires', operationName: 'NavbarRightQuery' })
    cy.contains('Look up responses to a questionnaire').should('be.visible')
  })

  it('An anonymous user wants to visit an unknown guide in the developer page', () => {
    Base.visit({ path: '/developer/guides/Unknown', operationName: 'NavbarRightQuery', failOnStatusCode: false })
    cy.contains('error.404.title').should('be.visible')
  })
})
