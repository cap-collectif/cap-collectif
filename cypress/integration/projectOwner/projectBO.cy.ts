import { AdminProjectPage } from '~e2e-pages/index'

describe('Project Owner', () => {
  describe('Project BO', () => {
    beforeEach(() => {
      cy.task('db:restore')
      cy.task('disable:feature', 'unstable__new_create_project')
      cy.directLoginAs('project_owner')
    })
    it('should allow a project admin to add his proposalform', () => {
      cy.interceptGraphQLOperation({ operationName: 'UpdateProjectAlphaMutation' })
      cy.interceptGraphQLOperation({ operationName: 'ProjectAdminPageQuery' })
      AdminProjectPage.visit('projectWithOwner')
      cy.wait('@ProjectAdminPageQuery')
      AdminProjectPage.openAddModal()
      AdminProjectPage.collectStepSelector.click()
      AdminProjectPage.fillStepInputs('title', 'label')
      cy.assertReactSelectOptionCount('#step-proposalForm', 1)
      cy.selectReactSelectOption('div[id="step-proposalForm"]', 'Formulaire avec propriétaire')
      AdminProjectPage.submitStepModal()
      AdminProjectPage.checkStepListLength(8)
      AdminProjectPage.save()
      cy.wait('@UpdateProjectAlphaMutation')
      cy.contains('global.saved')
    })
    it('should allow a project admin to add his questionnaire', () => {
      cy.interceptGraphQLOperation({ operationName: 'UpdateProjectAlphaMutation' })
      cy.interceptGraphQLOperation({ operationName: 'ProjectAdminPageQuery' })
      AdminProjectPage.visit('projectWithOwner')
      cy.wait('@ProjectAdminPageQuery')
      AdminProjectPage.openAddModal()
      AdminProjectPage.questionnaireSelector.click()
      AdminProjectPage.fillStepInputs('title', 'label')
      cy.assertReactSelectOptionCount('#step-questionnaire', 1)
      cy.selectReactSelectOption('#step-questionnaire', 'Questionnaire visible par un owner sans step')
      AdminProjectPage.submitStepModal()
      AdminProjectPage.checkStepListLength(8)
      AdminProjectPage.save()
      cy.wait('@UpdateProjectAlphaMutation')
      cy.contains('global.saved')
    })
  })
  describe('Authorization', () => {
    it('should display an unauthorized screen when admin project attempt to edit a project that he does not own', () => {
      cy.directLoginAs('project_owner')
      cy.checkAccessDenied('/admin/alpha/project/projectWithAnonymousQuestionnaire/edit')
    })
  })
})
