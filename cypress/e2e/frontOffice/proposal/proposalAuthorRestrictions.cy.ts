import { ProposalPage } from '~e2e-pages/index'
import { setupFeatureFlags } from '../../../support/setupFeatureFlags'

/**
 * @cypress-status compliant
 * @cypress-reason Checks author actions through the browser with GraphQL synchronization and isolated proposal data.
 */
context('Proposal author restrictions', () => {
  setupFeatureFlags({ new_vote_step: false, districts: true })

  beforeEach(() => {
    // Both scenarios change the same proposal; restore it before each attempt, including retries.
    cy.task('db:restore')
    cy.task(
      'run:sql',
      'UPDATE proposal SET title = "Rénovation du gymnase", is_draft = 0, publishedAt = "2017-02-01 00:03:00", deleted_at = NULL WHERE id = "proposal2"',
    )
    cy.task(
      'run:sql',
      'UPDATE step SET prevent_proposal_edit = 1, prevent_proposal_delete = 1 WHERE id = "collectstep1"',
    )
    cy.directLoginAs('user')
  })

  after(() => {
    cy.task('db:restore')
  })

  it('hides both actions on an already published proposal', () => {
    ProposalPage.visitProposalPage()
    cy.get('h1').should('contain', 'Rénovation du gymnase')
    cy.get('#proposal-edit-button').should('not.exist')
    cy.get('#proposal-delete-button').should('not.exist')
  })

  it('allows saving and publishing a draft, then hides both actions', () => {
    // Reuse fixture attachments for the required Documents question; this scenario tests publication permissions.
    cy.task('run:sql', 'UPDATE proposal SET is_draft = 1, publishedAt = NULL WHERE id = "proposal2"')
    cy.task('run:sql', 'UPDATE response SET question_id = 11 WHERE proposal_id = "proposal2" AND question_id = 12')
    ProposalPage.visitProposalPage()
    cy.get('#proposal-edit-button').should('be.visible').click()
    cy.get('#proposal_title').should('be.visible').clear().type('Draft saved with restrictions')
    cy.interceptGraphQLOperation({ operationName: 'ChangeProposalContentMutation' })
    cy.get('#confirm-proposal-create-as-draft').scrollIntoView().should('be.visible').and('be.enabled').click()
    cy.wait('@ChangeProposalContentMutation').its('response.body').should('not.have.property', 'errors')
    cy.get('@ChangeProposalContentMutation')
      .its('response.body.data.changeProposalContent.proposal.publicationStatus')
      .should('eq', 'DRAFT')
    cy.wait('@ProposalPageQuery')
    cy.get('h1').should('contain', 'Draft saved with restrictions')
    cy.get('#proposal-edit-button').should('be.visible')
    cy.get('#proposal-delete-button').should('be.visible')

    cy.get('#proposal-edit-button').should('be.visible').click()
    cy.get('#proposal_title').should('be.visible').clear().type('Draft published with restrictions')
    cy.get('#confirm-proposal-edit').scrollIntoView().should('be.visible').and('be.enabled').click()
    cy.wait('@ChangeProposalContentMutation').its('response.body').should('not.have.property', 'errors')
    cy.get('@ChangeProposalContentMutation')
      .its('response.body.data.changeProposalContent.proposal.publicationStatus')
      .should('eq', 'PUBLISHED')
    cy.wait('@ProposalPageQuery')
    cy.get('h1').should('contain', 'Draft published with restrictions')
    cy.get('#proposal-edit-button').should('not.exist')
    cy.get('#proposal-delete-button').should('not.exist')
    cy.reload()
    cy.wait('@ProposalPageQuery')
    cy.get('#proposal-edit-button').should('not.exist')
    cy.get('#proposal-delete-button').should('not.exist')
  })
})
