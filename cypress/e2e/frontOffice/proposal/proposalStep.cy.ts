import { setupFeatureFlags } from '../../../support/setupFeatureFlags'

const visitVoteStep = ({ project, step, stepType }: { project: string; step: string; stepType: string }) => {
  cy.interceptGraphQLOperation({ operationName: 'VoteStepQuery' })
  cy.interceptGraphQLOperation({ operationName: 'useVoteStepFilters_Query' })
  cy.visit(`/project/${project}/${stepType}/${step}`)
  cy.wait('@VoteStepQuery', { timeout: 15000 })
  cy.wait('@useVoteStepFilters_Query', { timeout: 15000 })
}

/**
 * @cypress-status reference
 * @cypress-reason Canonical example for authenticated visibility and filter tests synchronized with GraphQL queries.
 */
context('Proposal Step Page', () => {
  setupFeatureFlags({ new_vote_step: true, new_new_vote_step: true })

  before(() => {
    cy.task('db:restore')
  })

  describe('Vote step routing', () => {
    setupFeatureFlags({ new_vote_step: false, new_new_vote_step: false })

    const stepPaths = [
      '/project/budget-participatif-rennes/collect/collecte-des-propositions',
      '/project/budget-participatif-rennes/selection/selection',
    ]

    for (const path of stepPaths) {
      it(`switches views at ${path}`, () => {
        cy.interceptGraphQLOperation({ operationName: 'ProposalStepPageQuery' })
        cy.visit(path)
        cy.wait('@ProposalStepPageQuery')
        cy.get('.proposal__step-page').should('exist')

        cy.setFeatureFlags({ new_new_vote_step: true })
        cy.interceptGraphQLOperation({ operationName: 'VoteStepQuery' })
        cy.reload()
        cy.wait('@VoteStepQuery')
        cy.get('[id^="vote-step-page-"]').should('exist')
        cy.location('pathname').should('eq', path)

        cy.setFeatureFlags({ new_new_vote_step: false })
        cy.reload()
        cy.wait('@ProposalStepPageQuery')
        cy.get('.proposal__step-page').should('exist')
        cy.location('pathname').should('eq', path)
      })
    }
  })

  describe('Project Step Page FO', () => {
    it('should not see votes', () => {
      cy.directLoginAs('user')
      visitVoteStep({
        project: 'budget-participatif-idf-3',
        step: 'vote-des-franciliens',
        stepType: 'selection',
      })
      cy.contains('Budget Participatif IdF 3').should('be.visible')
      cy.get('button[id^="proposal-vote-btn-"]').should('not.exist')
    })
    it('should see votes', () => {
      cy.directLoginAs('user')
      visitVoteStep({
        project: 'budget-participatif-idf-3',
        step: 'le-suivi-des-projets-laureats',
        stepType: 'selection',
      })
      cy.get('button[id^="proposal-vote-btn-"]').should('exist')
    })
  })
  describe('filters', () => {
    it.skip('should filter archived projects', () => {
      visitVoteStep({
        project: 'bp-avec-archivage-des-propositions',
        stepType: 'collect',
        step: 'collecte-des-propositions-avec-archivage',
      })

      // filter archived
      cy.get('#proposal-filter-state-button').click()
      cy.contains('global-archived').click()
      cy.interceptGraphQLOperation({ operationName: 'VoteStepWebLayoutQuery' })
      cy.wait('@VoteStepWebLayoutQuery')
      cy.get('.cap-proposal-card').should('have.length', 1)

      // filter non archived
      cy.get('#proposal-filter-state-button').click()
      cy.contains('global.published').click()
      cy.interceptGraphQLOperation({ operationName: 'VoteStepWebLayoutQuery' })
      cy.wait('@VoteStepWebLayoutQuery')
      cy.get('.cap-proposal-card').should('have.length', 1)

      // filter all
      cy.get('#proposal-filter-state-button').click()
      cy.contains('global.select_state').click()
      cy.interceptGraphQLOperation({ operationName: 'VoteStepWebLayoutQuery' })
      cy.wait('@VoteStepWebLayoutQuery')
      cy.get('.cap-proposal-card').should('have.length', 2)
    })
  })
})
