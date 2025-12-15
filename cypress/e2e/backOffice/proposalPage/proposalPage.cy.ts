import { AdminProjectPage } from '~e2e-pages/index'

describe('Project Page BO', () => {
  beforeEach(() => {
    cy.directLoginAs('admin')
    cy.task('db:restore')
  })
  it('merges two proposals from the contribution tab', () => {
    cy.interceptGraphQLOperation({ operationName: 'ProjectAdminProposalsPageQuery' })
    cy.interceptGraphQLOperation({ operationName: 'CreateProposalFusionMutation' })
    AdminProjectPage.visitContributionsPage({
      projectSlug: 'projectOrgaVisibilityAdminAndMe',
      state: 'PUBLISHED',
      stepId: 'Q29sbGVjdFN0ZXA6Y29sbGVjdHN0ZXBPcmdhMg==',
    })
    cy.contains('loading-success')
    AdminProjectPage.mergeRows()
    cy.wait('@CreateProposalFusionMutation')
    AdminProjectPage.visitContributionsPage({
      projectSlug: 'projectOrgaVisibilityAdminAndMe',
      state: 'PUBLISHED',
      stepId: 'Q29sbGVjdFN0ZXA6Y29sbGVjdHN0ZXBPcmdhMg==',
    })
    cy.wait('@ProjectAdminProposalsPageQuery')
    cy.get('.merge-tag').its('length').should('be.gte', 2)
  })
})
