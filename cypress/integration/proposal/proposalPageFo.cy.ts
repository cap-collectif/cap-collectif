import { ProposalPage } from '~e2e-pages/index'

describe('Proposal Page', () => {
  describe('Project Page FO', () => {
    beforeEach(() => {
      cy.task('db:restore')
    })
    it('should see votes', () => {
      cy.directLoginAs('project_owner')
      ProposalPage.visitSelectionStepWithOpenedVoteAndDisplayed()
      cy.get('#ProposalPageVoteThreshold').should('contain', 'proposal.vote.threshold.title')
      cy.get('#proposal-page-tabs-tab-votes').should('contain', 'global.vote')
    })
    it('should not see votes', () => {
      cy.directLoginAs('project_owner')
      ProposalPage.visitSelectionStepWithOpenedVoteButNotDisplayed()
      cy.get('body').should('not.contain', '#ProposalPageVoteThreshold')
      cy.get('body').should('not.contain', '#proposal-page-tabs-tab-votes')
    })
    it('follow proposal and change type of following', () => {
      cy.directLoginAs('project_owner')
      ProposalPage.visitProposalPage()
      cy.on('uncaught:exception', (err, runnable) => {
        console.log('ERROR', err)
        return false
      })
      cy.get('#proposal-follow-btn-UHJvcG9zYWw6cHJvcG9zYWwy').click() //follow
      cy.wait(2000)
      cy.get('#proposal-follow-btn-UHJvcG9zYWw6cHJvcG9zYWwy').click() //open menu
      cy.get('.cap-menu__list') // expect menu
      cy.get('.cap-menu__list #proposal-follow-btn-minimal-UHJvcG9zYWw6cHJvcG9zYWwy input').should('be.checked') // check minimal is checked
      // essential
      cy.get('#proposal-follow-btn-UHJvcG9zYWw6cHJvcG9zYWwy').click() // close menu
      cy.wait(1000)
      cy.get('#proposal-follow-btn-UHJvcG9zYWw6cHJvcG9zYWwy').click() // open menu
      cy.get('.cap-menu__list #proposal-follow-btn-essential-UHJvcG9zYWw6cHJvcG9zYWwy input').check() //check essential
      cy.wait(1000)
      cy.get('#proposal-follow-btn-UHJvcG9zYWw6cHJvcG9zYWwy').click() // open menu
      cy.get('.cap-menu__list #proposal-follow-btn-essential-UHJvcG9zYWw6cHJvcG9zYWwy input').should('be.checked') // check essential is checked
      //ALL
      cy.get('#proposal-follow-btn-UHJvcG9zYWw6cHJvcG9zYWwy').click() // close menu
      cy.wait(1000)
      cy.get('#proposal-follow-btn-UHJvcG9zYWw6cHJvcG9zYWwy').click() // open menu
      cy.get('.cap-menu__list #proposal-follow-btn-all-UHJvcG9zYWw6cHJvcG9zYWwy input').check() //check all
      cy.wait(1000)
      cy.get('#proposal-follow-btn-UHJvcG9zYWw6cHJvcG9zYWwy').click() // open menu
      cy.get('.cap-menu__list #proposal-follow-btn-all-UHJvcG9zYWw6cHJvcG9zYWwy input').should('be.checked') // check all is checked
      // check if in follower list
      cy.get('#proposal-page-tabs-tab-followers').click()
      cy.get('#proposal-page-tabs-pane-followers').contains('Théo QP')
    })
  })
  it('should be possible ton see private proposal of the same organization', () => {
    cy.directLoginAs('christophe');
    ProposalPage.visitPrivateProposalPage()
    cy.get('#ProposalPageMainContent').should('be.visible')
  })
})
