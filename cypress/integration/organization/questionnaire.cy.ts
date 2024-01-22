import { FormListPage } from '~e2e-pages/index'

describe('Organization Questionnaire', () => {
  beforeEach(() => {
    cy.task('db:restore')
    cy.directLoginAs('valerie')
  })
  describe('Questionnaire BO', () => {
    it('CRUD questionnaire', () => {
      cy.interceptGraphQLOperation({ operationName: 'QuestionnaireListQuery' })
      cy.interceptGraphQLOperation({ operationName: 'CreateQuestionnaireMutation' })
      cy.interceptGraphQLOperation({ operationName: 'QuestionnaireAdminPageQuery' })
      cy.interceptGraphQLOperation({ operationName: 'UpdateQuestionnaireConfigurationMutation' })
      // list questionnaire
      FormListPage.visit('QUESTIONNAIRE')
      cy.wait('@QuestionnaireListQuery')
      cy.contains('Questionnaire owner orga')
      cy.contains('Questionnaire owner orga non rattaché à une step')
      cy.getByDataCy('questionnaire-item').should('have.length', 2)
      // open create questionnaire modal
      FormListPage.createForm('QUESTIONNAIRE', 'my new questionnaire')
      cy.wait('@CreateQuestionnaireMutation')
      // update questionnaire
      cy.wait('@QuestionnaireAdminPageQuery')
      // add section
      cy.get('#perso-field-add').click()
      cy.contains('question_modal.create.title').click()
      cy.get(`#${CSS.escape('questions[0].title')}`).type('my custom question')
      cy.get(`#${CSS.escape('questions[0].type')}`).select('global.question.types.text')
      cy.contains('global.validate').click()
      // submit questionnaire
      cy.get('#parameters-submit').click()
      cy.wait('@UpdateQuestionnaireConfigurationMutation')
      cy.contains('global.saved')
      // back to questionnaire list
      FormListPage.visit('QUESTIONNAIRE')
      cy.wait('@QuestionnaireListQuery')
      cy.contains('my new questionnaire')
      cy.getByDataCy('questionnaire-item').should('have.length', 3)
    })
  })
})
