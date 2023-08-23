import { AdminProjectPage } from '~e2e-pages/index'

describe('Project', () => {
  describe('Project BO', () => {
    beforeEach(() => {
      cy.task('db:restore')
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
      AdminProjectPage.checkStepListLength(7)
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
  describe('Contributions page', function () {
    beforeEach(() => {
      cy.directLoginAs('admin')
    })
    it('should display archived proposals', function () {
      AdminProjectPage.visitContributionsPage({
        projectSlug: 'projectProposalArchiving',
        state: 'ARCHIVED',
        stepId: 'Q29sbGVjdFN0ZXA6Y29sbGVjdFN0ZXBQcm9wb3NhbEFyY2hpdmluZw',
      })
      cy.contains('filter.count.status.archived {"num":1}')
      cy.contains('1 global.proposals')
      cy.contains('Proposition archivé')
    })
  })
})
