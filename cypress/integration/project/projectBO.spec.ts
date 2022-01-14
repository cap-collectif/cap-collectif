import { AdminProjectPage } from '~e2e-pages/index'

describe('Project', () => {
  describe('Project BO', () => {
    beforeEach(() => {
      cy.task('db:restore')
      cy.task('enable:feature', 'unstable__secret_ballot')
      cy.directLoginAs('admin')
    })
    it('should enable secret ballot on collect', () => {
      cy.interceptGraphQLOperation({ operationName: 'UpdateProjectAlphaMutation' })
      cy.interceptGraphQLOperation({ operationName: 'ProjectAdminPageQuery' })
      AdminProjectPage.visit('projectIdf3')
      cy.wait('@ProjectAdminPageQuery')
      AdminProjectPage.openAddModal()
      AdminProjectPage.collectStepSelector.click()
      cy.assertReactSelectOptionCount('#step-proposalForm', 1)
      cy.selectReactSelectOption('div[id="step-proposalForm"]', 'Formulaire avec propriétaire')
      AdminProjectPage.fillStepInputs('title', 'label')
      AdminProjectPage.toggleVote()
      cy.wait(1000)
      AdminProjectPage.toggleSecretBallot()
      cy.wait(1000)
      AdminProjectPage.submitStepModal()
      AdminProjectPage.checkStepListLength(6)
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
