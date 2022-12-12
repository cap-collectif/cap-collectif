describe('Organization Post', () => {
  beforeEach(() => {
    cy.task('db:restore')
    cy.directLoginAs('valerie')
  })
  describe('Post BO', () => {
    it('CRUD post', () => {
      cy.interceptGraphQLOperation({ operationName: 'postsQuery' })
      cy.interceptGraphQLOperation({ operationName: 'CreatePostMutation' })
      cy.interceptGraphQLOperation({ operationName: 'PostFormPageQuery' })
      cy.interceptGraphQLOperation({ operationName: 'UpdatePostMutation' })
      // list post
      cy.visit('/admin-next/posts')
      cy.wait('@postsQuery')
      cy.contains('Deuxieme article')
      cy.contains('Article créer par un membre du giec')
      cy.getByDataCy('post-item').should('have.length', 2)
      // open create post modal
      cy.getByDataCy('create-post-button').click()
      // create post
      cy.wait('@PostFormPageQuery')
      // udate title / body
      cy.get('#FR_FR-title').type('post title')
      cy.get('.jodit-wysiwyg').type('post body')
      cy.get(
        '#project > .Select__SelectContainer-bqbDYn > .react-select-container > .react-select__control > .react-select__value-container',
      ).click()
      cy.get('#react-select-3-option-0').click()
      // submit post
      cy.contains('admin.post.createAndPublish').click()
      cy.wait('@CreatePostMutation')
      // back to post list
      cy.visit('/admin-next/posts')
      cy.wait('@postsQuery')
      cy.getByDataCy('post-item').should('have.length', 3)
      cy.contains('post title').click()
      // update post
      cy.wait('@PostFormPageQuery')
      cy.get('#FR_FR-title').type('post title edited')
      cy.get('.jodit-wysiwyg').type('post body edited')
      cy.contains('global.save').click()
      cy.wait('@UpdatePostMutation')
      cy.contains('post-successfully-updated')
    })
  })
})
