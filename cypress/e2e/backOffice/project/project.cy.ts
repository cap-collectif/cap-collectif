import { AdminProjectPage } from '~e2e-pages/index'
import { AdminCollectStepPage, AdminConsultationPage, AdminQuestionnaireStepPage } from '~e2e/pages'

const visitCreatedStep = () => {
  cy.get<string>('@createdStepId').then(stepId => {
    cy.request('POST', '/graphql/internal', {
      query: 'query($id: ID!) { node(id: $id) { ... on Step { url } } }',
      variables: { id: stepId },
    })
      .its('body.data.node.url')
      .then(url => cy.visit(url))
  })
}

context('Project', () => {
  describe('Project BO', () => {
    beforeEach(() => {
      cy.task('db:restore')
      cy.directLoginAs('admin')
    })

    it('should enable secret ballot on collect', () => {
      cy.interceptGraphQLOperation({ operationName: 'CollectStepFormQuery' })
      AdminCollectStepPage.visitCollectPage('EDIT')
      cy.wait('@CollectStepFormQuery')
      AdminCollectStepPage.openVotesAccordion()
      AdminCollectStepPage.selectAdvancedTab()
      cy.get('#secretBallot').check({ force: true })
      AdminCollectStepPage.save()

      AdminCollectStepPage.visitCollectPage('EDIT')
      cy.wait('@CollectStepFormQuery')
      AdminCollectStepPage.openVotesAccordion()
      AdminCollectStepPage.selectAdvancedTab()
      cy.get('#secretBallot').should('be.checked')
    })

    it('should save project metadata changes', () => {
      cy.interceptGraphQLOperation({ operationName: 'ProjectConfigFormQuery' })
      cy.interceptGraphQLOperation({ operationName: 'UpdateNewProjectMutation' })
      cy.visit('/admin-next/project/UHJvamVjdDpwcm9qZWN0MTI=')
      cy.wait('@ProjectConfigFormQuery')
      cy.get('#parameters .cap-accordion__button').should('be.visible').click()

      cy.get('textarea[name="metaDescription"]').clear().type('Such meta')
      cy.wait('@UpdateNewProjectMutation').its('response.body.data.updateNewProject.errorCode').should('eq', null)
      cy.get('#video').clear().type('https://www.youtube.com/watch?v=dQw4w9WgXcQ')
      cy.wait('@UpdateNewProjectMutation').its('response.body.data.updateNewProject.errorCode').should('eq', null)
      cy.openDSSelect('#districts', true)
      cy.contains('.cap-async-select__option', 'Premier Quartier').click({ force: true })
      cy.wait('@UpdateNewProjectMutation').its('response.body.data.updateNewProject.errorCode').should('eq', null)

      cy.reload()
      cy.wait('@ProjectConfigFormQuery')
      cy.get('#parameters .cap-accordion__button').should('be.visible').click()
      cy.get('textarea[name="metaDescription"]').should('have.value', 'Such meta')
      cy.get('#video').should('have.value', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ')
      cy.get('#districts').should('contain', 'Premier Quartier')
    })

    it('should update an English project title and authors', () => {
      cy.interceptGraphQLOperation({ operationName: 'ProjectConfigFormQuery' })
      cy.interceptGraphQLOperation({ operationName: 'UpdateNewProjectMutation' })
      cy.interceptGraphQLOperation({ operationName: 'UserListFieldQuery' })
      cy.visit(`/admin-next/project/${btoa('Project:englishProject')}`)
      cy.wait('@ProjectConfigFormQuery')

      cy.get('#title').clear().type('English Project Edited')
      cy.wait('@UpdateNewProjectMutation').its('response.body.data.updateNewProject.errorCode').should('eq', null)
      cy.openDSSelect('#authors', true)
      cy.get('#authors input.cap-async-select__input').type('spyl', { force: true })
      cy.wait('@UserListFieldQuery')
      cy.contains('.cap-async-select__option', 'spyl').click()
      cy.wait('@UpdateNewProjectMutation').its('response.body.data.updateNewProject.errorCode').should('eq', null)

      cy.reload()
      cy.wait('@ProjectConfigFormQuery')
      cy.get('#title').should('have.value', 'English Project Edited')
      cy.get('#authors').should('contain', 'spyl')
    })

    it('should add a consultation step and render its content publicly', () => {
      cy.interceptGraphQLOperation({ operationName: 'CreateStepPageQuery' })
      cy.interceptGraphQLOperation({ operationName: 'AddConsultationStepMutation' })
      cy.interceptGraphQLOperation({ operationName: 'ConsultationStepFormQuery' })
      cy.interceptGraphQLOperation({ operationName: 'CreateOrUpdateConsultationMutation' })
      cy.interceptGraphQLOperation({ operationName: 'UpdateConsultationStepMutation' })
      cy.visit(`/admin-next/project/${btoa('Project:project4')}/create-step`)
      cy.wait('@CreateStepPageQuery')
      cy.contains('global.consultation').should('be.visible').click()
      cy.wait('@AddConsultationStepMutation')
      cy.wait('@ConsultationStepFormQuery')

      cy.get('#label').clear().type('ConsultationStepTitle')
      cy.get('.jodit-wysiwyg').first().type('ConsultationStepBody')
      AdminConsultationPage.fillModel(0, 'Consultation in project without step')
      cy.get('#save-consultation').should('be.enabled').click()
      cy.wait('@CreateOrUpdateConsultationMutation')
      cy.wait('@UpdateConsultationStepMutation').its('request.body.variables.input.stepId').as('createdStepId')
      visitCreatedStep()
      cy.contains('ConsultationStepBody').should('be.visible')
    })

    it('should add a collect step with a proposal form', () => {
      cy.interceptGraphQLOperation({ operationName: 'CreateStepPageQuery' })
      cy.interceptGraphQLOperation({ operationName: 'AddCollectStepMutation' })
      cy.interceptGraphQLOperation({ operationName: 'CollectStepFormQuery' })
      cy.interceptGraphQLOperation({ operationName: 'UpdateProposalFormMutation' })
      cy.interceptGraphQLOperation({ operationName: 'UpdateCollectStepMutation' })
      cy.visit(`/admin-next/project/${btoa('Project:project4')}/create-step`)
      cy.wait('@CreateStepPageQuery')
      cy.contains('global.collect.step.label').should('be.visible').click()
      cy.wait('@AddCollectStepMutation')
      cy.wait('@CollectStepFormQuery')

      cy.get('#label').clear().type('CollectStepTitle')
      cy.get('.jodit-wysiwyg').first().type('CollectStepBody')
      cy.contains('from-model').click()
      cy.get('#form_model_tab .cap-select__input').click({ force: true })
      cy.contains('.cap-select__option', 'Formulaire avec propriétaire').click({ force: true })
      cy.get('#save-collect-step').should('be.enabled').click()
      cy.wait('@UpdateProposalFormMutation')
      cy.wait('@UpdateCollectStepMutation')
        .its('response.body.data.updateCollectStep.collectStep.id')
        .as('createdStepId')
      cy.contains('CollectStepTitle').should('be.visible')

      visitCreatedStep()
      cy.get('.ProposalStepPage-rendered').should('be.visible')
      cy.contains('CollectStepBody').should('be.visible')
    })

    it('should add a questionnaire step and render its content publicly', () => {
      cy.interceptGraphQLOperation({ operationName: 'CreateStepPageQuery' })
      cy.interceptGraphQLOperation({ operationName: 'AddQuestionnaireStepMutation' })
      cy.interceptGraphQLOperation({ operationName: 'QuestionnaireStepFormQuery' })
      cy.interceptGraphQLOperation({ operationName: 'QuestionnaireListFieldQuery' })
      cy.interceptGraphQLOperation({ operationName: 'UpdateQuestionnaireStepMutation' })
      cy.interceptGraphQLOperation({ operationName: 'UpdateQuestionnaireMutation' })
      cy.visit(`/admin-next/project/${btoa('Project:project4')}/create-step`)
      cy.wait('@CreateStepPageQuery')
      cy.contains('global.questionnaire').should('be.visible').click()
      cy.wait('@AddQuestionnaireStepMutation')
      cy.wait('@QuestionnaireStepFormQuery')

      cy.get('#label').clear().type('QuestionnaireStepTitle')
      cy.get('.jodit-wysiwyg').first().type('QuestionnaireStepBody')
      AdminQuestionnaireStepPage.getFromModelTab().click()
      AdminQuestionnaireStepPage.getFromModelTabListInput().click()
      cy.wait('@QuestionnaireListFieldQuery')
      cy.contains('Questionnaire visible par un owner sans step').click()
      cy.get('#accordion-button-optional-settings').click()
      cy.get('[id^="footer-JoditTextArea"] .jodit-wysiwyg').type('QuestionnaireStepFooter')
      cy.get('#save-questionnaire-step').should('be.enabled').click()
      cy.wait('@UpdateQuestionnaireStepMutation').its('request.body.variables.input.stepId').as('createdStepId')
      cy.wait('@UpdateQuestionnaireMutation')
      visitCreatedStep()
      cy.get('#reply-form-container').should('be.visible')
      cy.contains('QuestionnaireStepBody').should('be.visible')
      cy.contains('QuestionnaireStepFooter').should('be.visible')
    })
  })
  describe('Authorization', () => {
    it('should redirect a project admin to the projects list when he cannot edit a project', () => {
      cy.directLoginAs('project_owner')
      cy.interceptGraphQLOperation({ operationName: 'ProjectIdQuery' })
      cy.visit(`/admin-next/project/${btoa('Project:projectWithAnonymousQuestionnaire')}`)
      cy.wait('@ProjectIdQuery')
      cy.url().should('include', '/admin-next/projects')
    })
  })
  describe('Project access', () => {
    beforeEach(() => {
      cy.task('db:restore')
      cy.directLoginAs('super_admin')
    })

    it('should restrict a project to selected groups', () => {
      cy.interceptGraphQLOperation({ operationName: 'ProjectConfigFormQuery' })
      cy.interceptGraphQLOperation({ operationName: 'UpdateNewProjectMutation' })
      cy.visit('/admin-next/project/UHJvamVjdDpwcm9qZWN0MTI=')
      cy.wait('@ProjectConfigFormQuery')
      cy.get('#access .cap-accordion__button').should('be.visible').click()

      cy.get('#visibility_choice-CUSTOM').check({ force: true })
      cy.openDSSelect('#restrictedViewerGroups', true)
      cy.contains('.cap-async-select__option', 'Agent de la ville').click({ force: true })
      cy.wait('@UpdateNewProjectMutation').its('response.body.data.updateNewProject.errorCode').should('eq', null)

      cy.visit('/project/projet-sans-etapes-participatives/presentation/presentation-3')
      cy.get('#restricted-access').should('be.visible')
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
      cy.contains('filter.count.status.archived') // num: 1
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
      AdminProjectPage.firstNumberOfMessagesSentToAuthor.should('contain', 'proposal.stats.messages.received') // num: 1

      // Sort by least messages received
      AdminProjectPage.sortSelect.click()
      AdminProjectPage.leastMessageReceivedFilter.should('exist').click()
      cy.wait('@ProjectAdminProposalsPageQuery')
      AdminProjectPage.firstNumberOfMessagesSentToAuthor.should('contain', 'proposal.stats.messages.received') // num: 0
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
})
