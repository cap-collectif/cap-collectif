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

  it('it should include VOTING questionnaire in model list', () => {
    cy.task('run:sql', 'UPDATE questionnaire SET type = "VOTING"')
    cy.visit(
      'admin-next/project/UHJvamVjdDpwcm9qZWN0V2l0aEFub255bW91c1F1ZXN0aW9ubmFpcmU=/update-step/questionnaire-step/qStepProjectAnonymousQuestionnaire?operationType=CREATE',
    )
    AdminQuestionnaireStepPage.getFromModelTab().click()
    AdminQuestionnaireStepPage.getFromModelTabListInput().click()
    cy.contains('Votre avis sur les JO 2024 à Paris')
  })
})
