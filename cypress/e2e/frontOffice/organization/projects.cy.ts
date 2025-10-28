// ! Note: this file was created from a text file left by a team member.
// ! It needs to be checked first, in case it's purely a duplicate of other tests, and if not, it needs to be fixed.
// import { AdminProjectsListPage } from '~e2e-pages/index'

// describe('Organization Project', () => {
//   before(() => {
//     cy.task('enable:feature', 'unstable__new_create_project')
//   })

//   beforeEach(() => {
//     cy.task('db:restore')
//     cy.directLoginAs('valerie')
//   })
//   describe('Project BO', () => {
//     it('CRUD project', () => {
//       cy.interceptGraphQLOperation({ operationName: 'projectsQuery' })
//       cy.interceptGraphQLOperation({ operationName: 'CreateProjectMutation' })
//       cy.interceptGraphQLOperation({ operationName: 'ProjectAdminPageQuery' })
//       cy.interceptGraphQLOperation({ operationName: 'UpdateProjectAlphaMutation' })
//       cy.interceptGraphQLOperation({ operationName: 'ProjectIdConfig' })
//       cy.interceptGraphQLOperation({ operationName: 'ProjectIdQuery' })
//       cy.interceptGraphQLOperation({ operationName: 'ProjectConfigFormQuery' })
//       cy.interceptGraphQLOperation({ operationName: 'UserListFieldQuery' })
//       cy.interceptGraphQLOperation({ operationName: 'CreateStepPageQuery' })

//       // projects list
//       AdminProjectsListPage.visit()
//       cy.wait('@projectsQuery')
//       cy.contains("Rapport d'évaluation 6 (AR6)")
//       cy.getByDataCy('project-item').should('have.length', 3)
//       cy.getByDataCy('create-project-button').click()

//       // project creation page
//       cy.wait('@UserListFieldQuery')
//       cy.get('div').contains('customize-your-new-project').should('exist').and('be.visible')
//       cy.getByDataCy('create-project-create-button').should('be.disabled')
//       cy.getByDataCy('create-project-modal-title').type('new project')
//       cy.getByDataCy('create-project-create-button').should('not.be.disabled')
//       cy.getByDataCy('create-project-modal-authors')
//         .children('div')
//         .children()
//         .should('have.class', 'cap-async-select--is-disabled')
//       cy.getByDataCy('create-project-create-button').should('not.be.disabled').click()
//       cy.wait('@CreateProjectMutation')

//       cy.wait('@ProjectIdQuery')
//       cy.wait('@ProjectConfigFormQuery')

//       // update project
//       cy.contains('my new project').click()
//       // add collect step
//       // TODO WIP New add collect step page on admin next is 404
//       cy.contains('global.add').click()
//       cy.contains('global.collect.step.label').click()
//       cy.get('#step-label').type('proposal form orga')
//       cy.get('#step-title').type('proposal form orga')
//       cy.assertReactSelectOptionCount('#step-proposalForm', 1)
//       cy.selectReactSelectOption('div[id="step-proposalForm"]', 'Formulaire organisation crée par un membre')
//       cy.get('#step-modal-submit').click()
//       // add questionnaire step
//       cy.contains('global.add').click()

//       cy.wait('@CreateStepPageQuery')
//       cy.contains('global.questionnaire').click()
//       cy.get('input[id="label"]').should('have.value', 'Questionnaire')
//       cy.get('p:contains("Répondez à l\'enquête")').should('have.length', 1)
//       cy.get('textarea:contains("Répondez à l\'enquête")').should('have.length', 1)
//       cy.get('#stepDurationType_choice-CUSTOM').should('be.checked')
//       cy.get('#isEnabled_choice-PUBLISHED').should('be.checked')
//       cy.contains('global.save').click()
//     })
//   })
// })
