import { QuestionnairePage } from '~e2e/pages'

describe('Questionnaire Logged-in as admin', () => {
  describe('Opened Questionnaire', () => {
    describe('Mutation', () => {
      beforeEach(() => {
        cy.task('db:restore')
        cy.directLoginAs('admin')
        QuestionnairePage.visitOpenedQuestionnaire()
      })
      it('should correctly add another reply when multiple replies is allowed', () => {
        cy.interceptGraphQLOperation({ operationName: 'AddUserReplyMutation' })
        QuestionnairePage.clickAnswerAgainButton()
        cy.get('#reply-form-container')
        QuestionnairePage.fillCreateFormWithRequiredFields()
        QuestionnairePage.submitForm()
        cy.wait('@AddUserReplyMutation')
        QuestionnairePage.assertToast()
        QuestionnairePage.assertRepliesLengthToBe(4)
      })
      it('should correctly update a reply', () => {
        cy.interceptGraphQLOperation({ operationName: 'UpdateUserReplyMutation' })
        QuestionnairePage.clickOnFirstReply()
        cy.get('#reply-form-container')
        QuestionnairePage.fillUpdateFormWithRequiredFields()
        QuestionnairePage.submitForm()
        cy.wait('@UpdateUserReplyMutation')
        QuestionnairePage.assertToast()
        QuestionnairePage.assertRepliesLengthToBe(3)
      })
      it('should correctly update a draft to a questionnaire with wrong values', () => {
        cy.interceptGraphQLOperation({ operationName: 'UpdateUserReplyMutation' })
        QuestionnairePage.clickOnFirstReply()
        cy.get('#reply-form-container')
        QuestionnairePage.fillUpdateFormWithWrongFields()
        QuestionnairePage.saveAsDraft()
        cy.wait('@UpdateUserReplyMutation')
        QuestionnairePage.assertToast('draft')
        QuestionnairePage.assertRepliesLengthToBe(3)
      })
      it('should correctly remove a reply', () => {
        cy.interceptGraphQLOperation({ operationName: 'DeleteUserReplyMutation' })
        QuestionnairePage.clickOnDeleteReplyModalButton()
        cy.contains('delete-confirmation').should('exist')
        QuestionnairePage.clickOnDeleteReplyConfirmationButton()
        cy.wait('@DeleteUserReplyMutation')
        QuestionnairePage.assertToast('delete')
        QuestionnairePage.assertRepliesLengthToBe(2)
      })
    })
  })
  describe('Multiple replies Questionnaire', () => {
    beforeEach(() => {
      cy.directLoginAs('admin')
      QuestionnairePage.visitQuestionnaireWithoutMultipleRepliesAllowed()
    })
    it('should not allow to add another reply when multiple replies is not allowed', () => {
      cy.get('.list-group > div').should('exist')
      cy.get('.btn-answer-again').should('not.exist')
    })
  })
  describe('Closed Questionnaire', () => {
    beforeEach(() => {
      cy.directLoginAs('admin')
      QuestionnairePage.visitClosedQuestionnaire()
    })
    it('should not be able to remove a reply in a closed questionnaire', () => {
      cy.get('btn-delete').should('not.exist')
    })
  })
})
