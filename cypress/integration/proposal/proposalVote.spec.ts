import { ProposalVotePage } from '~e2e-pages/index'

describe('Proposal Vote Page', () => {
  describe('Project Vote Page FO', () => {
    beforeEach(() => {
      // cy.task('db:restore')
      cy.directLoginAs('pierre')
    })
    // it('Logged in as user who doesnt full fill requirements and want to vote...', () => {
    //   ProposalVotePage.visit({
    //     project: 'bp-avec-vote-classement',
    //     step: 'collecte-avec-vote-classement-limite',
    //     stepType: 'collect',
    //   })
    //   cy.get('#proposal-vote-btn-UHJvcG9zYWw6cHJvcG9zYWwxMzg\\=').click() // Vote for proposal
    //   cy.wait(1000)
    //   cy.get('#proposal-vote-modal').should('exist')
    //   cy.wait(1000)
    //   cy.contains('verify.number').should('be.disabled')
    //   cy.get('[name="PhoneRequirement\\.phoneNumber"]').type('0623456789')
    //   cy.get('[name="CheckboxRequirement\\.viewerMeetsTheRequirement"]').click({ force: true })
    //   cy.get('[name="cap-date-input-id"]').type('24/03/1992')
    // })
  })
})
