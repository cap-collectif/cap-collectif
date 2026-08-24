import { Base } from '~e2e-pages/index'

describe('Public token routes', () => {
  beforeEach(() => {
    cy.task('db:restore')
  })
  afterEach(() => {
    cy.task('disable:feature', 'project_trash')
  })

  it('accepts a valid unsubscribe token and rejects an invalid one', () => {
    cy.visit('/actionToken?token=user5unsubscribeToken')
    cy.get('h3').should('contain', 'unsubscribe.page.title')

    cy.visit('/actionToken?token=wrong')
    cy.get('.flash-notif').should('be.visible').and('contain.text', 'invalid-token')
  })

  it('publishes a debate argument from a valid token and rejects invalid or consumed tokens', () => {
    Base.visit({
      path: '/publishDebateArgument?token=jesuisletokendudebateanonymousargumentagainst1',
      operationName: 'NavbarRightQuery',
    })
    cy.get('.flash-notif').should('be.visible').and('contain.text', 'argument.published.confirmation')

    Base.visit({ path: '/publishDebateArgument?token=jenexistepas', operationName: 'NavbarRightQuery' })
    cy.get('.flash-notif').should('be.visible').and('contain.text', 'invalid-token')

    Base.visit({
      path: '/publishDebateArgument?token=jesuisletokendudebateanonymousargumentfor1',
      operationName: 'NavbarRightQuery',
    })
    cy.get('.flash-notif').should('be.visible').and('contain.text', 'argument.published.already')
  })

  it('renders an open debate widget and returns a 404 for an unknown widget', () => {
    cy.visit('/widget_debate/RGViYXRlOmRlYmF0ZUNhbm5hYmlz')
    cy.get('#debate-step-page-app-widget').should('exist')

    cy.visit('/widget_debate/123456', { failOnStatusCode: false })
    cy.contains('error.404.title').should('be.visible')
  })

  it('displays project trash pages for participation and consultation projects', () => {
    cy.task('enable:feature', 'project_trash')
    cy.directLoginAs('admin')
    cy.visit('/projects/debat-sur-le-cannabis/trashed')
    cy.get('#main').should('contain', 'Un contenu digne de la corbeille')

    cy.visit('/projects/budget-avec-vote-limite/trashed')
    cy.get('.cap-bubble-attention-6').should('be.visible')

    cy.visit('/projects/projet-de-loi-renseignement/trashed')
    cy.get('body').should('not.contain', 'error.500')
  })
})
