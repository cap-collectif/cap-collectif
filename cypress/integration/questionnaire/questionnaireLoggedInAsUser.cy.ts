import { QuestionnairePage } from '~e2e/pages'

describe('Questionnaire Logged-in as user', () => {
  beforeEach(() => {
    cy.directLoginAs('user')
  })
  describe('Opened Questionnaire', () => {
    describe('Mutation', () => {
      beforeEach(() => {
        cy.task('db:restore')
        QuestionnairePage.visitOpenedQuestionnaire()
      })
      it('should correctly add a reply to a questionnaire', () => {
        cy.interceptGraphQLOperation({ operationName: 'AddUserReplyMutation' })
        QuestionnairePage.clickAnswerAgainButton()
        cy.get('#reply-form-container')
        QuestionnairePage.fillCreateFormWithRequiredFields()
        QuestionnairePage.submitForm()
        cy.wait('@AddUserReplyMutation')
        QuestionnairePage.assertToast()
        QuestionnairePage.assertRepliesLengthToBe(4)
      })
      it('should correctly add a private reply to a questionnaire', () => {
        cy.interceptGraphQLOperation({ operationName: 'AddUserReplyMutation' })
        QuestionnairePage.clickAnswerAgainButton()
        cy.get('#reply-form-container')
        QuestionnairePage.fillCreateFormWithRequiredFields()
        QuestionnairePage.checkPrivate()
        QuestionnairePage.submitForm()
        cy.wait('@AddUserReplyMutation')
        QuestionnairePage.assertToast()
        QuestionnairePage.assertRepliesLengthToBe(4)
      })
      it('should correctly add a draft to a questionnaire with wrong values', () => {
        cy.interceptGraphQLOperation({ operationName: 'AddUserReplyMutation' })
        QuestionnairePage.clickAnswerAgainButton()
        cy.get('#reply-form-container')
        QuestionnairePage.fillFormWithWrongFields()
        QuestionnairePage.saveAsDraft()
        cy.wait('@AddUserReplyMutation')
        QuestionnairePage.assertToast('draft')
        QuestionnairePage.assertRepliesLengthToBe(4)
        cy.contains('proposal.state.draft').should('exist')
      })
      it('should correctly add a reply to a questionnaire with majority question', () => {
        cy.interceptGraphQLOperation({ operationName: 'AddUserReplyMutation' })
        QuestionnairePage.visitQuestionnaireWithMajorityQuestion()
        QuestionnairePage.clickAnswerAgainButton()
        cy.get('#label-choice-CreateReplyForm-responses0-global-not-passable').click({ force: true })
        QuestionnairePage.submitForm()
        cy.wait('@AddUserReplyMutation')
        QuestionnairePage.assertToast()
      })
    })
    describe('Errors', () => {
      beforeEach(() => {
        QuestionnairePage.visitOpenedQuestionnaire()
      })
      it('should correctly display errors when user attempts to add a reply to a questionnaire without filling the required questions', () => {
        QuestionnairePage.clickAnswerAgainButton()
        cy.get('#reply-form-container')
        QuestionnairePage.fillFormWithoutRequirements()
        QuestionnairePage.submitForm()
        cy.contains('reply.constraints.field_mandatory').should('exist')
        cy.reload()
      })
      it('should correctly display errors when user attempts to add a reply to a questionnaire with not enough choices for required question', () => {
        QuestionnairePage.clickAnswerAgainButton()
        cy.get('#reply-form-container')
        QuestionnairePage.fillFormWithoutEnoughRequirementsChoices()
        QuestionnairePage.submitForm()
        cy.contains('reply.constraints.choices_equal {"nb":3}').should('exist')
      })
      it('should correctly display errors when user attempts to add a reply to a questionnaire with not enough choices for optional question', () => {
        QuestionnairePage.clickAnswerAgainButton()
        cy.get('#reply-form-container')
        QuestionnairePage.fillCreateFormWithRequiredFields()
        cy.contains('global.form.ranking.select').click({ force: true })
        QuestionnairePage.submitForm()
        cy.contains('reply.constraints.choices_min {"nb":2}').should('exist')
      })
    })
    it('should correctly place a ranking answer to the choice box', () => {
      QuestionnairePage.visitOpenedQuestionnaire()
      QuestionnairePage.clickAnswerAgainButton()
      cy.get('#reply-form-container')
      QuestionnairePage.fillCreateFormWithRequiredFields()
      cy.contains('global.form.ranking.select').click({ force: true })
      cy.get('#ranking__selection [data-rbd-draggable-id="UXVlc3Rpb25DaG9pY2U6cXVlc3Rpb25jaG9pY2UxMg==').contains(
        'Choix 1',
      )
    })
  })
  describe('Closed Questionnaire', () => {
    beforeEach(() => {
      QuestionnairePage.visitClosedQuestionnaire()
    })
    it('should show ended message when user attempt to reply to a closed questionnaire', () => {
      cy.contains('step.questionnaire.alert.ended.title').should('exist')
      cy.get('.ql-editor.ql-blank').should('have.attr', 'contenteditable', 'false')
    })
  })
})
