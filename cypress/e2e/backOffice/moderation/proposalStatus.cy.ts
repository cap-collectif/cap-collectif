import { AdminProposalPage } from '~e2e-pages/index'

describe('Proposal Admin - Publication status', () => {
  beforeEach(() => {
    cy.task('db:restore')
    cy.directLoginAs('admin')
  })

  it('changes a proposal status to DRAFT', () => {
    cy.interceptGraphQLOperation({ operationName: 'ProposalAdminPageQuery' })
    cy.interceptGraphQLOperation({ operationName: 'ChangeProposalPublicationStatusMutation' })

    AdminProposalPage.visit('proposal10')
    cy.wait('@ProposalAdminPageQuery')

    AdminProposalPage.statusTab.click({ force: true })
    AdminProposalPage.statusTabPane.should('be.visible')

    AdminProposalPage.selectPublicationStatus('DRAFT')
    AdminProposalPage.saveStatus()
    cy.wait('@ChangeProposalPublicationStatusMutation')
    cy.get('.alert__form_succeeded-message').should('be.visible')
    AdminProposalPage.publicationStatusInput('DRAFT').should('be.checked')
  })

  it('deletes a proposal and marks it as DELETED', () => {
    cy.interceptGraphQLOperation({ operationName: 'ProposalAdminPageQuery' })
    cy.interceptGraphQLOperation({ operationName: 'DeleteProposalMutation' })

    AdminProposalPage.visit('proposal10')
    cy.wait('@ProposalAdminPageQuery')

    AdminProposalPage.statusTab.click({ force: true })
    AdminProposalPage.statusTabPane.should('be.visible')

    cy.on('window:confirm', () => true)
    cy.get('#proposal-admin-page-tabs-pane-6 button[type="button"].btn.btn-danger').click()
    cy.wait('@DeleteProposalMutation')

    cy.get('.btn-group.disabled').should('be.visible')
    AdminProposalPage.publicationStatusInput('DELETED').should('be.checked')
  })
})
