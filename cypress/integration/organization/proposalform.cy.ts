import { ProposalFormPage, FormListPage } from '~e2e-pages/index'

describe('Organization Proposalform', () => {
  beforeEach(() => {
    cy.task('db:restore')
    cy.directLoginAs('valerie')
  })
  describe('Proposalform BO', () => {
    it('CRUD proposalform', () => {
      cy.interceptGraphQLOperation({ operationName: 'ProposalFormListQuery' })
      cy.interceptGraphQLOperation({ operationName: 'ProposalFormAdminPageQuery' })
      cy.interceptGraphQLOperation({ operationName: 'UpdateProposalFormMutation' })
      // list proposalform
      FormListPage.visit('PROPOSAL_FORM')
      cy.contains('Formulaire organisation crée par un admin')
      cy.contains('Formulaire organisation crée par un membre')
      cy.getByDataCy('proposalform-item').should('have.length', 3)
      // open create proposalform modal
      FormListPage.createForm('PROPOSAL_FORM', 'my new proposalform')
      // update proposalform
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
      FormListPage.visit('PROPOSAL_FORM')
      cy.contains('my new proposalform')
      cy.getByDataCy('proposalform-item').should('have.length', 4)
    })
    it('is possible to activate contact_author', () => {
      cy.interceptGraphQLOperation({ operationName: 'ChangeProposalFormParametersMutation' })
      ProposalFormPage.visit('proposalFormOrgaAdmin')
      ProposalFormPage.settingsTab.click()
      cy.wait(200)
      ProposalFormPage.contactAuthorCheckbox.should('have.value', 'false')
      ProposalFormPage.contactAuthorCheckbox.parent().click()
      ProposalFormPage.contactAuthorCheckbox.should('have.value', 'true')
      ProposalFormPage.saveParametersForm()
      cy.wait('@ChangeProposalFormParametersMutation')
      cy.contains('global.saved')
    })
  })
})
