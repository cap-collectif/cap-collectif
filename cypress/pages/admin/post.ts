export default new (class PostFormPage {
  get cy() {
    return cy
  }

  get frTitle() {
    return this.cy.get('input[type="text"]#FR_FR-title').should('exist').and('be.visible')
  }
  get frBody() {
    return this.cy.get('[data-cy="FR_FR-body"]').should('exist').and('be.visible')
  }
  get enTitle() {
    return this.cy.get('#EN_GB-title')
  }
  get enBody() {
    return this.cy.get('[data-cy="EN_GB-body"]')
  }
  get selectLocale() {
    return this.cy.get('#currentLocale', { timeout: 10000 })
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
    this.cy
      .get('button')
      .contains('admin.post.createAndPublish')
      .should('exist')
      .and('be.visible')
      .and('not.be.disabled')
      .click()
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
    this.cy.get('button').contains('capco.module.multilangue').should('be.visible').click()
    this.cy.wait(100)
    this.selectLocale.should('exist').and('be.visible').click()
    this.cy.get('.cap-select__option', { timeout: 4000 }).contains('english').should('be.visible').click()
    // Wait for English fields to appear
    this.enTitle.should('be.visible')
    this.enBody.should('be.visible')
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
    this.enTitle.should('exist').and('be.visible').type('English title')
    this.enBody.should('exist').and('be.visible').type('I love cats!')
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
    this.cy.contains(title, { timeout: 1000 }).should('exist').and('be.visible')
  }
  updateSuccessToastAppears() {
    cy.contains('post-successfully-updated', { timeout: 10000 }).should('be.visible')
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
