import { AdminProjectPage } from '~e2e-pages/index'

describe('Project Owner', () => {
  describe('Project BO', () => {
    beforeEach(() => {
      cy.task('db:restore')
      cy.task('disable:feature', 'unstable__new_create_project')
      cy.directLoginAs('project_owner')
    })
    it.only('should allow a project admin to add his proposalform', () => {
      AdminProjectPage.visit('projectWithOwner')
      AdminProjectPage.openAddModal()
      AdminProjectPage.collectStepSelector.click()
      cy.wait('@ProjectAdminCollectStepFormProposalsQuery')
      AdminProjectPage.fillStepInputs('title', 'label')

      cy.assertReactSelectOptionCount('#step-proposalForm', 1)
      cy.get('div[id="step-proposalForm"]').click()
      cy.contains('Formulaire avec propriétaire')
      cy.get('body').type('{enter}')
      AdminProjectPage.submitStepModal()
      AdminProjectPage.checkStepListLength(8)
      AdminProjectPage.save()

      cy.wait('@UpdateProjectAlphaMutation')
      cy.wait('@ProjectAdminAnalysisTabQuery')
      cy.wait('@ProjectAdminContributionsPageQuery')

      cy.contains('global.saved', { timeout: 10000 })
    })
    it('should allow a project admin to add his questionnaire', () => {
      cy.interceptGraphQLOperation({ operationName: 'ProjectAdminQuestionnaireStepFormQuestionnairesQuery' })
      AdminProjectPage.visit('projectWithOwner')
      AdminProjectPage.openAddModal()
      AdminProjectPage.questionnaireSelector.click()
      cy.wait('@ProjectAdminQuestionnaireStepFormQuestionnairesQuery')
      AdminProjectPage.fillStepInputs('title', 'label')
      cy.assertReactSelectOptionCount('#step-questionnaire', 1)
      cy.get('#step-questionnaire').click()
      cy.contains('Questionnaire visible par un owner sans step')
      cy.get('body').type('{enter}')
      AdminProjectPage.submitStepModal()
      AdminProjectPage.checkStepListLength(8)
      AdminProjectPage.save()

      cy.wait('@UpdateProjectAlphaMutation')
      cy.wait('@ProjectAdminContributionsPageQuery')

      cy.contains('global.saved', { timeout: 10000 })
    })
  })
  describe('Authorization', () => {
    it('should display an unauthorized screen when admin project attempt to edit a project that he does not own', () => {
      cy.directLoginAs('project_owner')
      cy.checkAccessDenied('/admin/alpha/project/projectWithAnonymousQuestionnaire/edit')
    })
  })
})
