import { AdminProjectsListPage } from '~e2e-pages/index'

describe('Organization Project', () => {
  beforeEach(() => {
    cy.task('db:restore')
    cy.directLoginAs('valerie')
  })
  describe('Project BO', () => {
    it('CRUD project', () => {
      cy.interceptGraphQLOperation({ operationName: 'projectsQuery' })
      cy.interceptGraphQLOperation({ operationName: 'CreateProjectMutation' })
      cy.interceptGraphQLOperation({ operationName: 'ProjectAdminPageQuery' })
      cy.interceptGraphQLOperation({ operationName: 'UpdateProjectAlphaMutation' })
      // list project
      AdminProjectsListPage.visit()
      cy.wait('@projectsQuery')
      cy.contains("Rapport d'évaluation 6 (AR6)")
      cy.getByDataCy('project-item').should('have.length', 1)

      // open create project modal
      cy.getByDataCy('create-project-button').click()
      cy.getByDataCy('create-project-modal-create-button').should('be.disabled')
      cy.getByDataCy('create-project-modal-title').type('my new project')
      cy.getByDataCy('create-project-modal-authors')
        .children('div')
        .children()
        .should('have.class', 'cap-async-select--is-disabled')
      cy.getByDataCy('create-project-modal-create-button').should('not.be.disabled').click()
      cy.wait('@CreateProjectMutation')
      cy.contains('project-successfully-created')
      // update project
      cy.contains('my new project').click()
      cy.wait('@ProjectAdminPageQuery')
      // add collect step
      cy.get('#js-btn-create-step').click()
      cy.get('#collect_step').click()
      cy.get('#step-label').type('proposal form orga')
      cy.get('#step-title').type('proposal form orga')
      cy.assertReactSelectOptionCount('#step-proposalForm', 1)
      cy.selectReactSelectOption('div[id="step-proposalForm"]', 'Formulaire organisation crée par un membre')
      cy.get('#step-modal-submit').click()
      // add questionnaire step
      cy.get('#js-btn-create-step').click()
      cy.contains('global.questionnaire').click()
      cy.get('#step-label').type('questionnaire orga')
      cy.get('#step-title').type('questionnaire orga')
      cy.assertReactSelectOptionCount('#step-questionnaire', 1)
      cy.selectReactSelectOption('div[id="step-questionnaire"]', 'Questionnaire owner orga non rattaché à une step')
      cy.get('#step-modal-submit').click()
      // submit project
      cy.get('#submit-project-content').click()
      cy.wait('@UpdateProjectAlphaMutation')
      cy.contains('global.saved')
      // back to list project
      AdminProjectsListPage.visit()
      cy.wait('@projectsQuery')
      cy.contains('my new project')
      cy.getByDataCy('project-item').should('have.length', 2)
    })
  })
})
