import { englishBody } from '../../../cypress/integration/post/post.cy'

export default new (class PostFormPage {
  get cy() {
    return cy
  }

  get frTitle() {
    return this.cy.get('input[type="text"]#FR_FR-title')
  }
  get frBody() {
    return this.cy.get('#FR_FR-body')
  }
  get enTitle() {
    return this.cy.get('#EN_GB-title')
  }
  get enBody() {
    return this.cy.get('#EN_GB-body')
  }
  get selectLocale() {
    return this.cy.get('#currentLocale')
  }

  getInput(id: string) {
    return this.cy.get(`#${id}`)
  }
  visitPostsList() {
    this.cy.visit(`/admin-next/posts`)
  }
  visitCreatePostFromProposal() {
    this.cy.visit('/admin-next/post?proposalId=UHJvcG9zYWw6cHJvcG9zYWxBcmNoaXZpbmdTdGVwTm90QXJjaGl2ZWQ=')
  }
  visitPostWithId(postId: string) {
    this.cy.visit(`/admin-next/post?id=${postId}`)
  }
  clickNewArticleButton() {
    this.cy.getByDataCy('create-post-button').click()
  }
  clickCreateAndPublishButton() {
    this.cy.get('button').contains('admin.post.createAndPublish').click()
  }
  checkCreateButtonState(state: 'enabled' | 'disabled') {
    if (state === 'enabled') {
      this.cy.get('button').contains('admin.post.createAndPublish').should('not.have.attr', 'disabled')
    } else {
      this.cy.get('button').contains('admin.post.createAndPublish').should('have.attr', 'disabled')
    }
  }
  clickUpdateButton() {
    this.cy.get('button').contains('global.save').click()
  }
  clickLinkedContentAccordion() {
    this.cy.get('button').contains('admin.fields.blog_post.group_linked_content').click()
  }
  clickSelectAuthors() {
    this.cy.get('#authors').click()
  }
  selectAuthor(author: string) {
    this.cy.get('[id^="react-select"][id*="option"]').contains(author).click()
  }
  clickSelectProject() {
    this.cy.get('#projects').click()
  }
  selectProject(projectTitleElement: string) {
    this.cy.get('[id^="react-select"][id*="option"]').contains(projectTitleElement).click()
  }
  switchToEnglish() {
    this.cy.get('button').contains('capco.module.multilangue').click()
    this.cy.wait(50)
    this.selectLocale.click()
    this.cy.get('.cap-select__option').contains('english').click()
  }
  checkLinkedProposalInputDoesNotExist() {
    this.cy.get('#accordion-panel-place')
    this.cy.contains('proposal').should('not.exist')
  }
  checkTitleValue(title: string) {
    this.frTitle.should('be.visible').invoke('val').should('eq', title)
  }
  checkBodyValue(body: string) {
    this.frBody.contains(body)
  }
  addEnglishTranslation() {
    this.switchToEnglish()
    this.enTitle.type('A title in English')
    this.enBody.type(englishBody)
  }
  openDeleteModal() {
    this.cy.contains('admin.global.delete').click()
  }
  clickDeleteConfirmationButton() {
    this.cy.getByDataCy('deletion-confirmation').click()
  }
  updateTitle(title: string) {
    this.frTitle.type(title)
  }
  updateBody(body: string) {
    this.frBody.type(body)
  }
  updateArticle(title: string, body: string) {
    this.updateTitle(title)
    this.updateBody(body)
  }
  articleShouldExist(title: string) {
    this.cy.contains(title).should('exist')
  }
  updateSuccessToastAppears() {
    this.cy.contains('post-successfully-updated')
  }

  checkInputProperties(inputId: string, shouldExist: 'exist' | 'not.exist', disabled?: boolean, value?: string | null) {
    this.getInput(inputId).should(shouldExist)
    if (shouldExist === 'exist') {
      if (disabled === true) {
        this.getInput(inputId).should('have.attr', 'disabled')
      } else {
        console.log(this.getInput(inputId))
        this.getInput(inputId).should('not.have.attr', 'disabled')
      }
      console.log(this.getInput(inputId))
      this.getInput(inputId).should('have.value', value)
    }
  }
})()
