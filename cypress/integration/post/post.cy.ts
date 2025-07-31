import { PostFormPage } from 'cypress/pages/index'

export const englishBody = 'I love cats!'

const postId = 'UG9zdDpwb3N0V2l0aE9yZ2FNZW1iZXIy'
const postTitle = 'Mon chat'
const postContent = 'Ouragan-Lion'
const linkedProposal = 'Proposition non archivé'

describe('CRUD', () => {
  before(() => {
    cy.task('db:restore')
    cy.task('enable:feature', 'multilangue')
  })

  it('Views post list', () => {
    cy.directLoginAs('admin')
    cy.interceptGraphQLOperation({ operationName: 'postsQuery' })
    PostFormPage.visitPostsList()
    cy.wait('@postsQuery')
    cy.contains('Post FR 12')
    cy.getByDataCy('post-item').should('exist').and('have.length.greaterThan', 15)
  })

  // #region FROM POSTS LIST
  it('Views create post page coming from posts list - as ADMIN ', () => {
    cy.interceptGraphQLOperation({ operationName: 'UserListFieldQuery' })
    cy.interceptGraphQLOperation({ operationName: 'postsQuery' })
    cy.directLoginAs('admin')
    PostFormPage.visitPostsList()
    cy.wait('@postsQuery', { timeout: 10000 })
    PostFormPage.clickNewArticleButton()
    cy.wait('@UserListFieldQuery', { timeout: 10000 })
    PostFormPage.updateArticle('Titre', 'Contenu')
    cy.get('#authors input').should('not.have.attr', 'disabled')
    PostFormPage.checkInputProperties('proposals', 'not.exist')
    cy.get('#projects input').should('exist')
    PostFormPage.checkInputProperties('themes', 'exist', false, '')
    PostFormPage.getInput('displayedOnBlog').should('be.checked')
  })

  it('Views create post page coming from posts list - as ORGA MEMBER ', () => {
    cy.interceptGraphQLOperation({ operationName: 'UserListFieldQuery' })
    cy.interceptGraphQLOperation({ operationName: 'postsQuery' })
    cy.directLoginAs('valerie')
    PostFormPage.visitPostsList()
    cy.wait('@postsQuery')
    PostFormPage.clickNewArticleButton()
    cy.wait('@UserListFieldQuery', { timeout: 10000 })
    PostFormPage.updateArticle('Titre', 'Contenu')
    cy.get('#authors input').should('have.attr', 'disabled')
    PostFormPage.checkInputProperties('proposals', 'not.exist')
    cy.get('#projects input').should('exist').and('not.have.attr', 'disabled') // mandatory
    PostFormPage.checkInputProperties('themes', 'not.exist')
    PostFormPage.checkInputProperties('proposals', 'not.exist')
    PostFormPage.getInput('displayedOnBlog').should('not.exist')
  })

  it('Views create post page coming from posts list - as PROJECT ADMIN ', () => {
    cy.interceptGraphQLOperation({ operationName: 'UserListFieldQuery' })
    cy.interceptGraphQLOperation({ operationName: 'postsQuery' })
    cy.directLoginAs('project_owner')
    PostFormPage.visitPostsList()
    cy.wait('@postsQuery')
    PostFormPage.clickNewArticleButton()
    cy.wait('@UserListFieldQuery', { timeout: 10000 })
    PostFormPage.updateArticle('Titre', 'Contenu')
    cy.get('#authors input').should('have.attr', 'disabled')
    PostFormPage.checkInputProperties('proposals', 'not.exist')
    cy.get('#projects input').should('exist').and('not.have.attr', 'disabled')
    PostFormPage.checkInputProperties('themes', 'not.exist')
    PostFormPage.getInput('displayedOnBlog').should('not.exist')
  })
  // #endregion FROM POSTS LIST

  // #region FROM PROPOSAL PAGE
  it('Views create post page coming from Proposal page - as ADMIN ', () => {
    cy.interceptGraphQLOperation({ operationName: 'UserListFieldQuery' })
    cy.directLoginAs('admin')
    PostFormPage.visitCreatePostFromProposal()
    cy.wait('@UserListFieldQuery', { timeout: 10000 })
    PostFormPage.checkInputProperties('proposals', 'exist', true, linkedProposal)
    cy.get('#projects input').should('exist').and('have.attr', 'disabled')
    PostFormPage.checkInputProperties('themes', 'exist', false, '')
    PostFormPage.checkCreateButtonState('disabled')
    PostFormPage.updateArticle('Titre', 'Contenu')
    PostFormPage.getInput('displayedOnBlog').should('be.checked')
    PostFormPage.checkCreateButtonState('enabled')
  })

  it('Views create post page coming from Proposal page - as ORGA MEMBER ', () => {
    cy.interceptGraphQLOperation({ operationName: 'UserListFieldQuery' })
    cy.directLoginAs('valerie')
    PostFormPage.visitCreatePostFromProposal()
    cy.wait('@UserListFieldQuery', { timeout: 10000 })
    PostFormPage.checkInputProperties('proposals', 'exist', true, linkedProposal)
    PostFormPage.checkInputProperties('projects', 'not.exist')
    PostFormPage.checkInputProperties('themes', 'not.exist')
    PostFormPage.checkCreateButtonState('disabled')
    PostFormPage.updateArticle('Titre', 'Contenu')
    PostFormPage.getInput('displayedOnBlog').should('not.exist')
    PostFormPage.checkCreateButtonState('enabled')
  })

  it('Views create post page coming from Proposal page - as PROJECT ADMIN ', () => {
    cy.directLoginAs('project_owner')
    cy.interceptGraphQLOperation({ operationName: 'UserListFieldQuery' })
    PostFormPage.visitCreatePostFromProposal()
    cy.wait('@UserListFieldQuery', { timeout: 10000 })
    PostFormPage.checkInputProperties('proposals', 'exist', true, linkedProposal)
    PostFormPage.checkInputProperties('projects', 'not.exist')
    PostFormPage.checkInputProperties('themes', 'not.exist')
    //
    PostFormPage.checkCreateButtonState('disabled')
    PostFormPage.updateArticle('Titre', 'Contenu')
    PostFormPage.getInput('displayedOnBlog').should('not.exist')
    PostFormPage.checkCreateButtonState('enabled')
  })
  // #endregion FROM PROPOSAL PAGE

  // #region CRUD
  it('Creates post', () => {
    cy.directLoginAs('admin')
    cy.interceptGraphQLOperation({ operationName: 'postsQuery' })
    cy.interceptGraphQLOperation({ operationName: 'CreatePostMutation' })
    cy.interceptGraphQLOperation({ operationName: 'UserListFieldQuery' })
    cy.interceptGraphQLOperation({ operationName: 'ProjectListFieldQuery' })
    PostFormPage.visitPostsList()
    cy.wait('@postsQuery', { timeout: 15000 })
    PostFormPage.clickNewArticleButton()
    cy.wait('@UserListFieldQuery', { timeout: 20000 })
    PostFormPage.frTitle.should('be.visible').and('not.be.disabled')
    PostFormPage.frBody.should('be.visible').and('not.be.disabled')
    PostFormPage.updateTitle(postTitle)
    PostFormPage.frTitle.should('have.value', postTitle)
    PostFormPage.updateBody(postContent)
    PostFormPage.frBody.should('contain', postContent)
    PostFormPage.checkLinkedProposalInputDoesNotExist()
    PostFormPage.checkCreateButtonState('enabled')
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

  it('Reads post', () => {
    cy.directLoginAs('admin')
    cy.interceptGraphQLOperation({ operationName: 'UserListFieldQuery' })
    cy.interceptGraphQLOperation({ operationName: 'postsQuery' })
    PostFormPage.visitPostsList()
    cy.wait('@postsQuery', { timeout: 15000 })
    cy.getByDataCy('post-item').should('exist')
    PostFormPage.visitPostWithId(postId)
    cy.wait('@UserListFieldQuery', { timeout: 20000 })
    PostFormPage.articleShouldExist('Deuxieme article')
  })

  it('Updates post', () => {
    cy.directLoginAs('admin')
    cy.interceptGraphQLOperation({ operationName: 'UserListFieldQuery' })
    cy.interceptGraphQLOperation({ operationName: 'UpdatePostMutation' })
    cy.interceptGraphQLOperation({ operationName: 'ProjectListFieldQuery' })
    PostFormPage.visitPostWithId(postId)
    cy.wait('@UserListFieldQuery', { timeout: 20000 })
    PostFormPage.frTitle.should('be.visible').and('not.be.disabled')
    PostFormPage.frBody.should('be.visible').and('not.be.disabled')
    PostFormPage.updateArticle(' edited', 'edited')
    PostFormPage.frTitle.should('have.value', 'Deuxieme article edited')
    PostFormPage.frBody.should('contain', 'edited')
    PostFormPage.clickSelectProject()
    cy.wait('@ProjectListFieldQuery', { timeout: 15000 })
    PostFormPage.selectProject('Débats')
    PostFormPage.clickSelectAuthors()
    PostFormPage.selectAuthor('admin')
    PostFormPage.clickUpdateButton()
    PostFormPage.addEnglishTranslation()
    PostFormPage.enTitle.should('have.value', 'English title', { timeout: 4000 })
    PostFormPage.enBody.should('contain', englishBody, { timeout: 4000 })
    // eslint-disable-next-line jest/valid-expect-in-promise
    cy.wait('@UpdatePostMutation', { timeout: 10000 }).then(interception => {
      // eslint-disable-next-line jest/valid-expect
      expect(interception?.response?.body.data.updatePost.post.title).to.equal(`Deuxieme article edited`)
    })
    PostFormPage.updateSuccessToastAppears()
  })

  it('Deletes post', () => {
    cy.directLoginAs('admin')
    cy.interceptGraphQLOperation({ operationName: 'UserListFieldQuery' })
    cy.interceptGraphQLOperation({ operationName: 'DeletePostMutation' })
    cy.interceptGraphQLOperation({ operationName: 'postsQuery' })
    PostFormPage.visitPostWithId(postId)
    cy.wait('@UserListFieldQuery', { timeout: 20000 })
    PostFormPage.openDeleteModal()
    cy.getByDataCy('deletion-confirmation').should('be.visible').and('not.be.disabled')
    PostFormPage.clickDeleteConfirmationButton()
    // eslint-disable-next-line jest/valid-expect-in-promise
    cy.wait('@DeletePostMutation').then(interception => {
      // eslint-disable-next-line jest/valid-expect
      expect(interception?.response?.body.data.deletePost.deletedPostId).to.equal(postId)
    })
    cy.wait('@postsQuery', { timeout: 15000 })
  })
  // #endregion test CRUD
})
