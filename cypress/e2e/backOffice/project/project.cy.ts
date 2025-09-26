import { AdminProjectPage } from '~e2e-pages/index'

context('Project', () => {
  describe('Project BO', () => {
    beforeEach(() => {
      cy.task('db:restore')
      cy.directLoginAs('admin')
      cy.task('disable:feature', 'unstable__new_create_project')
    })
    it('should enable secret ballot on collect', () => {
      cy.interceptGraphQLOperation({ operationName: 'UserListFieldQuery' })
      AdminProjectPage.visit('projectIdf3')
      cy.wait('@UserListFieldQuery')
      AdminProjectPage.openAddModal()
      AdminProjectPage.collectStepSelector.click()
      cy.wait('@ProjectAdminCollectStepFormProposalsQuery')

      cy.assertReactSelectOptionCount('#step-proposalForm', 1)
      cy.get('div[id="step-proposalForm"]').click()
      cy.contains('Formulaire avec propriétaire')
      cy.get('body').type('{enter}')

      AdminProjectPage.fillStepInputs('title', 'label')
      AdminProjectPage.toggleVote()
      AdminProjectPage.toggleSecretBallot()
      AdminProjectPage.submitStepModal()
      AdminProjectPage.checkStepListLength(7)
      AdminProjectPage.save()

      cy.wait('@UpdateProjectAlphaMutation')
      cy.wait('@ProjectAdminAnalysisTabQuery')
      cy.wait('@ProjectAdminContributionsPageQuery')

      cy.contains('global.saved')
    })
  })
  describe('Authorization', () => {
    it('should display an unauthorized screen when admin project attempt to edit a project that he does not own', () => {
      cy.directLoginAs('project_owner')
      cy.checkAccessDenied('/admin/alpha/project/projectWithAnonymousQuestionnaire/edit')
    })
  })
  describe('Contributions page', () => {
    beforeEach(() => {
      cy.directLoginAs('admin')
    })
    it('should display archived proposals', () => {
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
  describe('Messages sent to author', () => {
    beforeEach(() => {
      cy.task('db:restore')
      cy.directLoginAs('admin')
    })
    it('should display a number of messages sent to author if the proposal form allows it and it should be sortable', () => {
      AdminProjectPage.visitProposalsTab('projectCorona')
      AdminProjectPage.selectCollectStep('Collecte de projets')

      cy.wait('@ProjectAdminProposalsPageQuery')
      AdminProjectPage.firstNumberOfMessagesSentToAuthor.should('exist')

      // Sort by most messages received
      AdminProjectPage.sortSelect.click()
      AdminProjectPage.mostMessageReceivedFilter.should('exist').click()
      cy.wait('@ProjectAdminProposalsPageQuery')
      AdminProjectPage.firstNumberOfMessagesSentToAuthor.should('contain', 'proposal.stats.messages.received {"num":1}')

      // Sort by least messages received
      AdminProjectPage.sortSelect.click()
      AdminProjectPage.leastMessageReceivedFilter.should('exist').click()
      cy.wait('@ProjectAdminProposalsPageQuery')
      AdminProjectPage.firstNumberOfMessagesSentToAuthor.should('contain', 'proposal.stats.messages.received {"num":0}')
    })
    it('should not display nor messages number nor sorting if the proposal form does not allow it', () => {
      AdminProjectPage.visitProposalsTab('projectIdf')
      AdminProjectPage.selectCollectStep('Collecte des projets Idf (privée)')
      cy.wait('@ProjectAdminProposalsPageQuery')
      cy.get('span[title="proposal_stats_messages_received"]').should('not.exist')

      AdminProjectPage.sortSelect.click({ force: true })
      AdminProjectPage.mostMessageReceivedFilter.should('not.exist')
      AdminProjectPage.leastMessageReceivedFilter.should('not.exist')
    })
  })
  describe('Filter progress status on analysis tab', () => {
    beforeEach(() => {
      cy.task('db:restore')
      cy.directLoginAs('admin')
    })
    it('should filter proposals with progress state "IN_PROGRESS" and with an analyst on tab analysis', () => {
      AdminProjectPage.visitAnalysisTabPath('projectIdf')

      cy.wait('@AdminRightNavbarAppQuery')
      cy.wait('@ProjectAdminPageQuery')
      cy.wait('@ProjectAdminAnalysisTabQuery')
      cy.wait('@ProjectAdminContributionsPageQuery')
      cy.wait('@ProjectAdminParticipantTabQuery')

      cy.get('div > span').contains('table.header.filter.progress').click()
      cy.get('ul > li:nth-child(3) > span').contains('step.status.open').click()

      cy.wait('@ProjectAdminAnalysisTabQuery')
      AdminProjectPage.assertProposalsAndProgressStatusLengthOnAnalysisTab('step.status.open', 2)

      cy.get('div > span').contains('panel.analysis.subtitle').click()
      cy.get('div:nth-child(4) li:nth-child(2) span:nth-child(2)').contains('Jpec').click()

      cy.wait('@ProjectAdminAnalysisTabQuery')
      AdminProjectPage.assertProposalsAndProgressStatusLengthOnAnalysisTab('step.status.open', 1)
    })
  })
})
