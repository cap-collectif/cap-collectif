import { AdminProposalPage } from '~e2e-pages/index'

describe('Proposal Admin', () => {
  describe('Proposal Edition', () => {
    beforeEach(() => {
      cy.task('db:restore')
      cy.directLoginAs('super_admin')
    })
    it('should allow an admin to edit a proposal content', () => {
      Cypress.on('uncaught:exception', (err, runnable) => {
        // returning false here prevents Cypress from
        // failing the test
        return false
      })
      cy.interceptGraphQLOperation({ operationName: 'ChangeProposalContentMutation' })
      cy.interceptGraphQLOperation({ operationName: 'ProposalAdminPageQuery' })
      AdminProposalPage.visit('proposal10')
      cy.wait('@ProposalAdminPageQuery')
      AdminProposalPage.fillProposalInputs(
        'Proposition pas encore votable',
        'Un super résumé',
        'Une super description',
        'HAHAHA',
        'Je suis privée',
      )
      AdminProposalPage.fillAddressField('5 Allée Rallier du Baty, 35000 Rennes, France')
      AdminProposalPage.selectCategory('pCategory2')
      AdminProposalPage.uploadMediaFile()
      AdminProposalPage.uploadDocumentFile()
      AdminProposalPage.save()
      cy.wait('@ChangeProposalContentMutation')
      cy.contains('global.saved')
    })
  })
})
