import { QuestionnairePage } from '~e2e/pages'

context('Questionnaire Anonymous', () => {
  describe('Opened Questionnaire', () => {
    beforeEach(() => {
      QuestionnairePage.visitOpenedQuestionnaire()
    })
    it('should correctly show a questionnaire', () => {
      cy.contains('Projet avec questionnaire').should('exist')
      cy.contains('Insert Long Text here').should('exist')
    })
    it('should show disabled field when anonymous user attempt to reply on a questionnaire where anonymous replies are not allowed', () => {
      cy.contains('reply.not_logged_in.error').should('exist')
      cy.get('#CreateReplyForm-responses0').should('be.disabled')
    })
  })
  describe('Anonymous Questionnaire', () => {
    beforeEach(() => {
      cy.task('enable:feature', 'anonymous_questionnaire')
      QuestionnairePage.visitAnonymousQuestionnaire()
    })
    it('should correctly show a questionnaire', () => {
      cy.contains('Questionnaire avec participants anonyme').should('exist')
    })
    it('should correctly create/update/delete an anonymous reply', () => {
      cy.interceptGraphQLOperation({ operationName: 'AddAnonymousReplyMutation' })
      cy.interceptGraphQLOperation({ operationName: 'UpdateAnonymousReplyMutation' })
      cy.interceptGraphQLOperation({ operationName: 'DeleteAnonymousReplyMutation' })

      QuestionnairePage.fillAnonymousQuestionnaire()
      cy.confirmCaptcha()
      cy.wait(1000)
      QuestionnairePage.submitForm()
      cy.wait('@AddAnonymousReplyMutation', { timeout: 15000 })
      QuestionnairePage.assertToast()
      QuestionnairePage.assertRepliesLengthToBe(1)

      QuestionnairePage.clickOnFirstReply()
      QuestionnairePage.fillEditAnonymousQuestionnaire()
      QuestionnairePage.submitForm()
      cy.wait('@UpdateAnonymousReplyMutation', { timeout: 15000 })
      QuestionnairePage.assertToast()
      QuestionnairePage.assertRepliesLengthToBe(1)

      QuestionnairePage.clickOnDeleteReplyModalButton()
      cy.contains('delete-confirmation').should('exist')
      QuestionnairePage.clickOnDeleteReplyConfirmationButton()
      cy.wait('@DeleteAnonymousReplyMutation', { timeout: 15000 })
      QuestionnairePage.assertToast('delete')
      cy.get('.list-group').should('not.exist')
    })
  })
})
