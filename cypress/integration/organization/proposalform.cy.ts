import { ProposalFormPage } from '~e2e-pages/index'

describe('Organization Proposalform', () => {
  beforeEach(() => {
    cy.task('db:restore')
    cy.directLoginAs('valerie')
  })
  describe('Proposalform BO', () => {
    it('CRUD proposalform', () => {
      cy.interceptGraphQLOperation({ operationName: 'ProposalFormListQuery' })
      cy.interceptGraphQLOperation({ operationName: 'CreateProposalFormMutation' })
      cy.interceptGraphQLOperation({ operationName: 'ProposalFormAdminPageQuery' })
      cy.interceptGraphQLOperation({ operationName: 'UpdateProposalFormMutation' })
      // list proposalform
      cy.visit('/admin-next/proposalForm')
      cy.wait('@ProposalFormListQuery')
      cy.contains('Formulaire organisation crée par un admin')
      cy.contains('Formulaire organisation crée par un membre')
      cy.getByDataCy('proposalform-item').should('have.length', 2)
      // open create proposalform modal
      cy.getByDataCy('create-proposalform-button').click()
      cy.getByDataCy('create-proposalform-modal-title').type('my new proposalform')
      cy.getByDataCy('create-proposalform-modal-create-button').click()
      cy.wait('@CreateProposalFormMutation')
      cy.contains('proposal-form-successfully-created')
      // update proposalform
      cy.contains('my new proposalform').click()
      cy.wait('@ProposalFormAdminPageQuery')
      // add section
      cy.get('#perso-field-add').click()
      cy.contains('create-section').click()
      cy.get(`#${CSS.escape('questions[0].title')}`).type('my custom section')
      cy.contains('global.validate').click()
      // submit proposalform
      cy.get('#proposal-form-admin-content-save').click()
      cy.wait('@UpdateProposalFormMutation')
      cy.contains('global.saved')
      // back to proposalform list
      cy.visit('/admin-next/proposalForm')
      cy.wait('@ProposalFormListQuery')
      cy.contains('my new proposalform')
      cy.getByDataCy('proposalform-item').should('have.length', 3)
    })
    it('is possible to activate contact_author', () => {
      cy.interceptGraphQLOperation({ operationName: 'ChangeProposalFormParametersMutation' })
      ProposalFormPage.visit('proposalFormOrgaAdmin')
      ProposalFormPage.settingsTab.click()
      cy.wait(200);
      ProposalFormPage.contactAuthorCheckbox.should('have.value', 'false')
      ProposalFormPage.contactAuthorCheckbox.parent().click()
      ProposalFormPage.contactAuthorCheckbox.should('have.value', 'true')
      ProposalFormPage.saveParametersForm()
      cy.wait('@ChangeProposalFormParametersMutation')
      cy.contains('global.saved')
    })
  })
})
