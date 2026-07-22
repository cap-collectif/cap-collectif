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

  it('updates a proposal selection status', () => {
    cy.interceptGraphQLOperation({ operationName: 'ProposalAdminPageQuery' })
    cy.interceptGraphQLOperation({ operationName: 'ChangeSelectionStatusMutation' })

    AdminProposalPage.visit('proposal10')
    cy.wait('@ProposalAdminPageQuery')

    AdminProposalPage.advancementTab.click({ force: true })
    AdminProposalPage.advancementTabPane.should('be.visible')
    cy.get('input[name="selections[0].selected"]').check({ force: true })
    AdminProposalPage.selectSelectionStatus('Soumis au vote')
    AdminProposalPage.saveAdvancement()

    cy.wait('@ChangeSelectionStatusMutation')
    cy.get('.alert__form_succeeded-message').should('be.visible')
    cy.get('select[name="selections[0].status"]').should('have.value', 'status4')
  })

  it('adds a realisation step to a proposal', () => {
    cy.interceptGraphQLOperation({ operationName: 'ProposalAdminPageQuery' })
    cy.interceptGraphQLOperation({ operationName: 'ChangeProposalProgressStepsMutation' })

    AdminProposalPage.visit('proposal10')
    cy.wait('@ProposalAdminPageQuery')

    AdminProposalPage.advancementTab.click({ force: true })
    AdminProposalPage.advancementTabPane.should('be.visible')
    AdminProposalPage.enableRealisationStep()
    AdminProposalPage.addRealisationStep('Banque')
    AdminProposalPage.saveAdvancement()

    cy.wait('@ChangeProposalProgressStepsMutation')
    AdminProposalPage.visit('proposal10')
    cy.wait('@ProposalAdminPageQuery')
    AdminProposalPage.advancementTab.click({ force: true })
    AdminProposalPage.advancementTabPane.should('contain', 'Banque')
  })

  it('shows proposal followers', () => {
    cy.interceptGraphQLOperation({ operationName: 'ProposalAdminPageQuery' })

    AdminProposalPage.visit('proposal10')
    cy.wait('@ProposalAdminPageQuery')

    AdminProposalPage.followersTab.click({ force: true })
    AdminProposalPage.followersTabPane.should('be.visible')
    AdminProposalPage.followersTabPane.find('.proposal__follower').should('have.length', 2)
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

    AdminProposalPage.visit('proposal10')
    cy.wait('@ProposalAdminPageQuery')
    AdminProposalPage.followersTab.click({ force: true })
    AdminProposalPage.followersTabPane.should('be.visible')
    AdminProposalPage.followersTabPane.find('.proposal__follower').should('not.exist')
  })
})
