describe('Blog page', () => {
  before(() => {
    cy.task('db:restore')
  })
  beforeEach(() => {
    cy.interceptGraphQLOperation({ operationName: 'PostsListQuery' })
    cy.interceptGraphQLOperation({ operationName: 'PostListSectionFiltersQuery' })
    cy.interceptGraphQLOperation({ operationName: 'ProjectListFieldFrontOfficeQuery' })
  })
  it('User wants to see published posts', () => {
    cy.visit('/blog')
    cy.wait('@PostsListQuery', { timeout: 10000 })
    cy.get('.cap-post-card').should('have.length', 10)
  })
  it('Posts can be filtered by theme', () => {
    cy.visit('/blog')
    cy.wait('@PostListSectionFiltersQuery')
    cy.wait('@ProjectListFieldFrontOfficeQuery')
    cy.dsSelectSetOption('div#news-theme', 'Transport')
    cy.wait('@PostsListQuery', { timeout: 10000 })
    cy.get('.cap-post-card').should('have.length', 0)
  })
  it('Posts can be filtered by project', () => {
    cy.visit('/blog?project=UHJvamVjdDpwcm9qZWN0MQ%3D%3D') // Croissance, Innovation, Disruption
    cy.wait('@PostsListQuery', { timeout: 10000 })
    cy.get('.cap-post-card').should('have.length', 5)
    cy.contains('Post FR 5').should('exist')
    cy.contains('Post FR 8').should('not.exist')
  })
})
