type VisitOptions = {
  project: string
  questionnaire: string
}

export default new (class QuestionnairePage {
  get cy() {
    return cy
  }

  fillCreateFormWithRequiredFields() {
    this.cy.get('#CreateReplyForm-responses0').type('abc')
    this.cy
      .get('#label-checkbox-CreateReplyForm-responses1_choice-UXVlc3Rpb25DaG9pY2U6cXVlc3Rpb25jaG9pY2Ux')
      .click({ force: true })
    this.cy
      .get('#label-checkbox-CreateReplyForm-responses1_choice-UXVlc3Rpb25DaG9pY2U6cXVlc3Rpb25jaG9pY2Uy')
      .click({ force: true })
    this.cy
      .get('#label-checkbox-CreateReplyForm-responses1_choice-UXVlc3Rpb25DaG9pY2U6cXVlc3Rpb25jaG9pY2Uz')
      .click({ force: true })
  }

  fillUpdateFormWithRequiredFields() {
    this.cy.get('#UpdateReplyForm-UmVwbHk6cmVwbHk5-responses0').type('abc')
    this.cy
      .get(
        '#label-checkbox-UpdateReplyForm-UmVwbHk6cmVwbHk5-responses1_choice-UXVlc3Rpb25DaG9pY2U6cXVlc3Rpb25jaG9pY2Ux',
      )
      .click({ force: true })
    this.cy
      .get(
        '#label-checkbox-UpdateReplyForm-UmVwbHk6cmVwbHk5-responses1_choice-UXVlc3Rpb25DaG9pY2U6cXVlc3Rpb25jaG9pY2Uy',
      )
      .click({ force: true })
    this.cy
      .get(
        '#label-checkbox-UpdateReplyForm-UmVwbHk6cmVwbHk5-responses1_choice-UXVlc3Rpb25DaG9pY2U6cXVlc3Rpb25jaG9pY2Uz',
      )
      .click({ force: true })
  }

  fillFormWithWrongFields() {
    this.cy.get('#CreateReplyForm-responses0').type('abc')
    this.cy
      .get('#label-checkbox-CreateReplyForm-responses1_choice-UXVlc3Rpb25DaG9pY2U6cXVlc3Rpb25jaG9pY2Ux')
      .click({ force: true })
  }

  fillUpdateFormWithWrongFields() {
    this.cy.get('#UpdateReplyForm-UmVwbHk6cmVwbHk5-responses0').type('abc')
    this.cy
      .get(
        '#label-checkbox-UpdateReplyForm-UmVwbHk6cmVwbHk5-responses1_choice-UXVlc3Rpb25DaG9pY2U6cXVlc3Rpb25jaG9pY2Ux',
      )
      .click({ force: true })
  }

  fillFormWithoutRequirements() {
    this.cy.get('#CreateReplyForm-responses0').type('abc')
  }

  fillFormWithoutEnoughRequirementsChoices() {
    this.cy
      .get('#label-checkbox-CreateReplyForm-responses1_choice-UXVlc3Rpb25DaG9pY2U6cXVlc3Rpb25jaG9pY2Ux')
      .click({ force: true })
    this.cy
      .get('#label-checkbox-CreateReplyForm-responses1_choice-UXVlc3Rpb25DaG9pY2U6cXVlc3Rpb25jaG9pY2Uy')
      .click({ force: true })
  }

  fillAnonymousQuestionnaire() {
    this.cy.get('#CreateReplyForm-responses0').type('abc')
  }

  fillEditAnonymousQuestionnaire() {
    this.cy.get('input').type('abcdef')
  }

  clickAnswerAgainButton() {
    this.cy.get('.btn-answer-again').click({ force: true })
  }

  checkPrivate() {
    this.cy.get('#label-checkbox-CreateReplyForm-reply-private').click({ force: true })
  }

  submitForm() {
    this.cy.contains('global.send').click({ force: true })
  }

  saveAsDraft() {
    this.cy.contains('global.save_as_draft').click({ force: true })
  }

  clickOnFirstReply() {
    this.cy.contains('reply.show.link').click({ force: true })
  }

  clickOnDeleteReplyModalButton() {
    this.cy.get('.btn-delete').first().click({ force: true })
  }

  clickOnDeleteReplyConfirmationButton() {
    this.cy.contains('global.delete').click({ force: true })
  }

  assertRepliesLengthToBe(expectedLength: number) {
    this.cy.get('.list-group > div').should('have.length', expectedLength)
  }

  assertToast(type: 'create' | 'draft' | 'delete' = 'create') {
    const message = {
      create: 'reply.request.create.success',
      draft: 'your-answer-has-been-saved-as-a-draft',
      delete: 'reply.request.delete.success',
    }
    this.cy.contains(message[type])
  }

  visit({ project, questionnaire }: VisitOptions) {
    this.cy.interceptGraphQLOperation({ operationName: 'QuestionnaireStepPageQuery' })
    this.cy.visit(`/project/${project}/questionnaire/${questionnaire}`)
    return this.cy.wait('@QuestionnaireStepPageQuery')
  }

  visitOpenedQuestionnaire() {
    return this.visit({
      project: 'projet-avec-questionnaire',
      questionnaire: 'questionnaire-des-jo-2024',
    })
  }

  visitClosedQuestionnaire() {
    return this.visit({
      project: 'projet-avec-questionnaire',
      questionnaire: 'etape-de-questionnaire-fermee',
    })
  }

  visitQuestionnaireWithoutMultipleRepliesAllowed() {
    return this.visit({
      project: 'projet-avec-questionnaire',
      questionnaire: 'questionnaire',
    })
  }

  visitAnonymousQuestionnaire() {
    return this.visit({
      project: 'projet-avec-questionnaire-anonyme',
      questionnaire: 'questionnaire-step-anonymous',
    })
  }

  visitQuestionnaireWithMajorityQuestion() {
    return this.visit({
      project: 'projet-pour-consolider-les-exports',
      questionnaire: 'questionnaire-export',
    })
  }
})()
