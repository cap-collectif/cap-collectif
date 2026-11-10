import { Base } from '~e2e-pages/index'
import proposalVote from '~e2e-pages/proposal/proposalVote'

describe('Ranked proposal votes', () => {
  // Restoring also isolates retries after a persisted order change.
  beforeEach(() => {
    cy.task('db:restore')
  })

  /**
   * @cypress-status compliant
   * @cypress-reason Checks a browser drag changes the vote order and survives a server reload.
   */
  it('persists the vote order after dragging a proposal', () => {
    const table = '#vote-table-step-collecte-avec-vote-classement-limite'
    const titles = `${table} .proposals-user-votes__title`
    cy.directLoginAs('user')
    Base.visit({ path: '/projects/bp-avec-vote-classement/votes', operationName: 'ProposalsUserVotesPageAppQuery' })

    return cy
      .get(titles)
      .should('have.length.greaterThan', 1)
      .then($titles => {
        const originalOrder = [...$titles].map(element => element.textContent)
        const expectedOrder = [originalOrder[originalOrder.length - 1], ...originalOrder.slice(0, -1)]
        proposalVote.moveLastVoteToFirst(table)
        cy.get(titles).should($reordered => {
          assert.deepEqual(
            [...$reordered].map(element => element.textContent),
            expectedOrder,
          )
        })

        cy.interceptGraphQLOperation({ operationName: 'UpdateProposalVotesMutation' })
        cy.get(`${table} #confirm-update-votes`).should('be.enabled').click()
        cy.wait('@UpdateProposalVotesMutation').its('response.body.errors').should('not.exist')
        Base.reload({ operationName: 'ProposalsUserVotesPageAppQuery' })
        cy.get(titles).should($persisted => {
          assert.deepEqual(
            [...$persisted].map(element => element.textContent),
            expectedOrder,
          )
        })
      })
  })
})
