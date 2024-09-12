type Publication = 'published' | 'draft'

export default new (class AdminQuestionnaireStepPage {
  get cy() {
    return cy
  }

  visitQuestionnaireStepPage() {
    const url = `/admin-next/project/UHJvamVjdDpwcm9qZWN0OA==/update-step/questionnaire-step/questionnairestep1`
    cy.visit(url)
    cy.interceptGraphQLOperation({ operationName: 'QuestionnaireStepFormQuery' })
  }

  save() {
    cy.interceptGraphQLOperation({ operationName: 'UpdateQuestionnaireStepMutation' })
    cy.interceptGraphQLOperation({ operationName: 'UpdateQuestionnaireMutation' })
    this.getSaveButton().click()
    cy.wait('@UpdateQuestionnaireStepMutation')
    cy.wait('@UpdateQuestionnaireMutation')
    cy.contains('global.changes.saved')
  }

  fillLabel(text: string) {
    return cy.get('#label').clear().type(text)
  }

  fillDescription(text: string) {
    return cy.get('.jodit-wysiwyg').clear().type(text)
  }

  openQuestionnaireAccordion() {
    return cy.get('button#accordion-button-global\\.questionnaire').click({ force: true })
  }

  openAddQuestionModal() {
    cy.get('#add-question-btn').click()
    cy.get('#open-question-modal').click()
  }

  chooseQuestionTypeAndFillBasics(type: string, title: string, description: string) {
    this.openAddQuestionModal()
    cy.getByDataCy(type).click()
    cy.getByDataCy('next-step').click()
    cy.get('#temporaryQuestion\\.title').click({ force: true }).type(title)
    cy.get('#temporaryQuestion\\.description-JoditTextArea-fr_fr > div > div > div.jodit-workplace > div.jodit-wysiwyg')
      .click({ force: true })
      .type(description)
  }

  addAShortAnswerQuestion(title: string, description: string) {
    this.chooseQuestionTypeAndFillBasics('question\\.types\\.text', title, description)
    cy.getByDataCy('last-step').click()
    cy.getByDataCy('finish-question').click()
  }

  addAButtonsQuestion(title: string, description: string) {
    this.chooseQuestionTypeAndFillBasics('question\\.types\\.buttons', title, description)
    cy.get('#temporaryQuestion\\.responseColorsDisabled').click({ force: true })
    // TODO map this
    cy.get('#add-choice-btn').click({ force: true })
    cy.get('input#temporaryQuestion\\.choices\\.0\\.title').type('c1')
    cy.get('#add-choice-btn').click({ force: true })
    cy.get('input#temporaryQuestion\\.choices\\.1\\.title').type('c2')
    cy.getByDataCy('last-step').click()
    cy.getByDataCy('finish-question').click()
  }

  openOptionnalSettingsAccordion() {
    return cy.get('#accordion-button-optional-settings').click()
  }

  fillMetaDescription(metaDescription: string) {
    return cy.get('#metaDescription').type(metaDescription)
  }

  fillCustomCode(customCode: string) {
    return cy.get('#customCode').click({ force: true }).type(customCode)
  }

  getSaveButton() {
    return cy.get('#save-questionnaire-step')
  }
})()
