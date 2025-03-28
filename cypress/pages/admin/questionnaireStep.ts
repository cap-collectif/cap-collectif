export default new (class AdminQuestionnaireStepPage {
  get cy() {
    return cy
  }

  visitQuestionnaireStepPage() {
    cy.visit('/admin-next/project/UHJvamVjdDpwcm9qZWN0OA==/update-step/questionnaire-step/questionnairestep1')
    cy.interceptGraphQLOperation({ operationName: 'QuestionnaireStepFormQuery' })
  }

  visitQuestionnaireStepPageWithJumps() {
    cy.visit('/admin-next/project/UHJvamVjdDpwcm9qZWN0OA==/update-step/questionnaire-step/questionnairestepJump')
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

  openAddQuestionModal() {
    cy.get('#add-question-btn').click()
    cy.get('#open-question-modal').click()
  }

  openAddJumpModal(redirection?: boolean) {
    cy.get('#add-jump-btn').click()
    cy.get(redirection ? '#add-redirection' : '#add-conditional-jump').click()
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

  addAJump() {
    this.openAddJumpModal()
    const questionId = '#temporaryJump\\.jumps\\.0\\.conditions\\.0\\.question\\.id'
    cy.openDSSelect(questionId)
    this.cy.selectDSSelectFirstOption()
    const operatorId = '#temporaryJump\\.jumps\\.0\\.conditions\\.0\\.operator'
    cy.openDSSelect(operatorId)
    this.cy.selectDSSelectFirstOption()
    const valueId = '#temporaryJump\\.jumps\\.0\\.conditions\\.0\\.value\\.id'
    cy.openDSSelect(valueId)
    this.cy.selectDSSelectFirstOption()
    const destinationId = '#temporaryJump\\.jumps\\.0\\.destination\\.id'
    cy.openDSSelect(destinationId)
    this.cy.selectDSSelectFirstOption()
    cy.get('#confirm-form-create').click()
  }

  addARedirection() {
    this.openAddJumpModal(true)
    const questionId = '#temporaryJump\\.id'
    cy.openDSSelect(questionId)
    this.cy.selectDSSelectFirstOption()
    const destinationId = '#temporaryJump\\.alwaysJumpDestinationQuestion\\.id'
    cy.openDSSelect(destinationId)
    this.cy.selectDSSelectFirstOption()
    cy.get('#confirm-form-create').click()
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
