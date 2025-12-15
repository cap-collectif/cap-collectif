import { Base } from '~e2e-pages/index'

// !often fails locally, needs investigation
describe('Blog page', () => {
  beforeEach(() => {
    cy.task('db:restore')
    cy.interceptGraphQLOperation({ operationName: 'PostsListQuery' })
    cy.interceptGraphQLOperation({ operationName: 'PostListSectionFiltersQuery' })
    cy.interceptGraphQLOperation({ operationName: 'ProjectListFieldFrontOfficeQuery' })
    cy.task('enable:feature', 'blog')
  })

  it('User wants to see published posts', () => {
    cy.interceptGraphQLOperation({ operationName: 'PostsListQuery' })
    cy.visit('/blog', { failOnStatusCode: false })

    cy.wait('@PostsListQuery')
    cy.get('.cap-post-card').should('have.length', 10)
  })
  it('Posts can be filtered by theme', () => {
    cy.interceptGraphQLOperation({ operationName: 'PostsListQuery' })
    cy.interceptGraphQLOperation({ operationName: 'PostListSectionFiltersQuery' })
    cy.interceptGraphQLOperation({ operationName: 'ProjectListFieldFrontOfficeQuery' })
    cy.visit('/blog')
    cy.wait('@PostListSectionFiltersQuery')
    cy.wait('@ProjectListFieldFrontOfficeQuery')
    cy.dsSelectSetOption('div#news-theme', 'Transport')
    cy.wait('@PostsListQuery')
    cy.get('.cap-post-card').should('have.length', 0)
  })
  it('Posts can be filtered by project', () => {
    cy.interceptGraphQLOperation({ operationName: 'PostsListQuery' })
    cy.visit('/blog?project=UHJvamVjdDpwcm9qZWN0MQ%3D%3D') // Croissance, Innovation, Disruption
    cy.wait('@PostsListQuery')
    cy.get('.cap-post-card').should('have.length', 5)
    cy.contains('Post FR 5').should('exist')
    cy.contains('Post FR 8').should('not.exist')
  })
})

describe('Blog', () => {
  before(() => {
    cy.task('enable:feature', 'blog')
    Cypress.on('uncaught:exception', (err, runnable) => {
      // returning false here prevents Cypress from failing the test
      return false
    })
  })
  beforeEach(() => {
    cy.task('db:restore')
    cy.task('enable:feature', 'blog')
  })

  describe('Anonymous wants to comment a blogpost', () => {
    it('should allow anonymous user to submit a comment', () => {
      cy.task('disable:feature', 'moderation_comment')
      Base.visit({ path: '/blog/post-fr-2', operationName: 'NavbarRightQuery' })

      cy.get('[name="body"]').should('be.visible')

      cy.get('[name="body"]').type("J'ai un truc à dire")
      cy.get('[name="authorName"]').type('Naruto')
      cy.get('[name="authorEmail"]').type('naruto72@gmail.com')

      cy.interceptGraphQLOperation({ operationName: 'AddCommentMutation' })
      cy.contains('comment.submit').click({ force: true })
      cy.wait('@AddCommentMutation')

      cy.contains('.toasts-container--top div', 'comment.submit_success').should('be.visible')

      cy.contains('.comments__section', "J'ai un truc à dire").should('be.visible')
    })
  })

  describe('Anonymous wants to comment a blogpost with moderation enabled', () => {
    it('should show email confirmation message when moderation is enabled', () => {
      cy.task('enable:feature', 'moderation_comment')

      Base.visit({ path: '/blog/post-fr-2', operationName: 'NavbarRightQuery' })

      cy.get('[name="body"]').should('be.visible')
      cy.get('[name="body"]').type("J'ai un truc à dire")
      cy.get('[name="authorName"]').type('Naruto')
      cy.get('[name="authorEmail"]').type('naruto72@gmail.com')

      cy.interceptGraphQLOperation({ operationName: 'AddCommentMutation' })
      cy.contains('comment.submit').click({ force: true })
      cy.wait('@AddCommentMutation')

      cy.contains('.toasts-container--top div', 'confirm-email-address', { timeout: 5000 }).should('be.visible')
    })
  })

  describe('Logged in user wants to comment a blogpost', () => {
    it('should allow logged in user to submit a comment', () => {
      cy.task('disable:feature', 'moderation_comment')
      cy.directLoginAs('user')
      Base.visit({ path: '/blog/post-fr-2', operationName: 'NavBarMenuQuery' })

      cy.get('[name="body"]').should('be.visible')
      cy.get('[name="body"]').type("J'ai un truc à dire")

      cy.contains('comment.with_my_account').should('not.exist')
      cy.contains('comment.without_account').should('not.exist')

      cy.interceptGraphQLOperation({ operationName: 'AddCommentMutation' })
      cy.contains('comment.submit').click({ force: true })
      cy.wait('@AddCommentMutation')

      cy.contains('.toasts-container--top div', 'comment.submit_success').should('be.visible')
      cy.contains('.comments__section', "J'ai un truc à dire").should('be.visible')
    })
  })
})
