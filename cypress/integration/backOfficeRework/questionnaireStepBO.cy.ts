import { AdminQuestionnaireStepPage } from '~e2e/pages'

describe('Questionnaire Step back office', () => {
  beforeEach(() => {
    cy.task('db:restore')
    cy.task('enable:feature', 'unstable__new_create_project')
    cy.task('disable:feature', 'helpscout_beacon')
    cy.directLoginAs('super_admin')
  })

  it('should update the step when editing a existing questionnaire step', () => {
    AdminQuestionnaireStepPage.visitQuestionnaireStepPage()
    AdminQuestionnaireStepPage.fillLabel('Updated text')
    AdminQuestionnaireStepPage.fillDescription('Updated description')
    AdminQuestionnaireStepPage.addAShortAnswerQuestion('short title', 'short desc')
    AdminQuestionnaireStepPage.addAButtonsQuestion('short title', 'short desc')
    AdminQuestionnaireStepPage.openOptionnalSettingsAccordion()
    AdminQuestionnaireStepPage.fillMetaDescription('Meta description')
    AdminQuestionnaireStepPage.fillCustomCode('Custom code')
    AdminQuestionnaireStepPage.save()
  })
  it('should be possible to add a conditional jump and a redirection on a big questionnaire', () => {
    AdminQuestionnaireStepPage.visitQuestionnaireStepPageWithJumps()
    AdminQuestionnaireStepPage.addAJump()
    AdminQuestionnaireStepPage.addARedirection()
    AdminQuestionnaireStepPage.save()
  })
})
