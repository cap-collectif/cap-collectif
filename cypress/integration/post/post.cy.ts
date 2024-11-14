import { PostFormPage } from 'cypress/pages/index'

const postId = 'UG9zdDpwb3N0V2l0aE9yZ2FNZW1iZXIy'
const postTitle = 'Mon chat'
const postContent = 'Ouragan-Lion'
describe('CRUD', () => {
  beforeEach(() => {
    cy.directLoginAs('admin')
  })
  before(() => {
    cy.task('db:restore')
    cy.task('enable:feature', 'multilangue')
  })

  it('Views post list', () => {
    cy.interceptGraphQLOperation({ operationName: 'postsQuery' })
    PostFormPage.visitPostsList()
    cy.wait('@postsQuery')
    cy.contains('Post FR 12')
    cy.getByDataCy('post-item').should('exist')
  })

  // todo: add more cases --> create and update when logged as admin / project creator / organization member
  it('Create post', () => {
    cy.interceptGraphQLOperation({ operationName: 'postsQuery' })
    cy.interceptGraphQLOperation({ operationName: 'CreatePostMutation' })
    cy.interceptGraphQLOperation({ operationName: 'UserListFieldQuery' })
    cy.interceptGraphQLOperation({ operationName: 'ProjectListFieldQuery' })
    PostFormPage.visitPostsList()
    cy.wait('@postsQuery', { timeout: 15000 })
    PostFormPage.clickNewArticleButton()
    cy.wait('@UserListFieldQuery', { timeout: 20000 })
    PostFormPage.updateTitle(postTitle)
    PostFormPage.updateBody(postContent)
    PostFormPage.checkLinkedProposalInputDoesNotExist()
    // PostFormPage.checkCreateButtonState('enabled')
    PostFormPage.clickSelectProject()
    cy.wait('@ProjectListFieldQuery', { timeout: 15000 })
    PostFormPage.selectProject('Débat')
    PostFormPage.clickCreateAndPublishButton()
    // eslint-disable-next-line jest/valid-expect-in-promise
    cy.wait('@CreatePostMutation', { timeout: 15000 }).then(interception => {
      assert.isNotNull(interception?.response?.body.data.createPost)
    })
    cy.wait('@UserListFieldQuery', { timeout: 20000 })
    PostFormPage.checkTitleValue(postTitle)
    PostFormPage.checkBodyValue(postContent)
  })

  it('Read post', () => {
    cy.interceptGraphQLOperation({ operationName: 'UserListFieldQuery' })
    cy.interceptGraphQLOperation({ operationName: 'postsQuery' })
    PostFormPage.visitPostsList()
    cy.wait('@postsQuery', { timeout: 15000 })
    cy.getByDataCy('post-item').should('exist')
    PostFormPage.visitPostWithId(postId)
    cy.wait('@UserListFieldQuery', { timeout: 20000 })
    PostFormPage.articleShouldExist('Deuxieme article')
  })

  it('Update post', () => {
    cy.interceptGraphQLOperation({ operationName: 'UserListFieldQuery' })
    cy.interceptGraphQLOperation({ operationName: 'UpdatePostMutation' })
    cy.interceptGraphQLOperation({ operationName: 'ProjectListFieldQuery' })
    PostFormPage.visitPostWithId(postId)
    cy.wait('@UserListFieldQuery', { timeout: 20000 })
    PostFormPage.updateArticle('edited', 'edited')
    PostFormPage.clickSelectProject()
    cy.wait('@ProjectListFieldQuery', { timeout: 15000 })
    PostFormPage.selectProject('Débats')
    PostFormPage.clickSelectAuthors()
    PostFormPage.selectAuthor('admin')
    PostFormPage.clickUpdateButton()
    // TODO: uncomment line below when issue fixed -> https://github.com/cap-collectif/platform/issues/16732
    // PostFormPage.addEnglishTranslation()
    // eslint-disable-next-line jest/valid-expect-in-promise
    cy.wait('@UpdatePostMutation').then(interception => {
      // eslint-disable-next-line jest/valid-expect
      expect(interception?.response?.body.data.updatePost.post.title).to.equal(`Deuxieme articleedited`)
    })
    PostFormPage.updateSuccessToastAppears()
  })
  it('Delete post', () => {
    cy.interceptGraphQLOperation({ operationName: 'UserListFieldQuery' })
    cy.interceptGraphQLOperation({ operationName: 'DeletePostMutation' })
    cy.interceptGraphQLOperation({ operationName: 'postsQuery' })
    PostFormPage.visitPostWithId(postId)
    cy.wait('@UserListFieldQuery', { timeout: 20000 })
    PostFormPage.openDeleteModal()
    PostFormPage.clickDeleteConfirmationButton()
    // eslint-disable-next-line jest/valid-expect-in-promise
    cy.wait('@DeletePostMutation').then(interception => {
      // eslint-disable-next-line jest/valid-expect
      expect(interception?.response?.body.data.deletePost.deletedPostId).to.equal(postId)
    })
    cy.wait('@postsQuery', { timeout: 15000 })
  })
})
