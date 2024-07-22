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
    it('is possible to contact the author of a proposal', () => {
      cy.interceptGraphQLOperation({ operationName: 'ContactProposalAuthorMutation' })
      ProposalPage.visitContactableProposalPage()
      cy.get('#ProposalContactModal-show-button').click()
      cy.get('#ProposalContactModalForm', { timeout: 10000 })
      cy.get('#ProposalFormContactModal-senderName').type('John Doe')
      cy.get('#ProposalFormContactModal-replyEmail').type('john.doe@email.test')
      cy.get('#ProposalFormContactModal-message').type('Hello, I am John Doe')
      cy.get('#ProposalFormContactModal-submit').click()
      cy.wait('@ContactProposalAuthorMutation')
      cy.contains('message-sent-with-success').should('exist')
    })
  })
  it('should be possible to see every private proposal as a member of an organization', () => {
    cy.directLoginAs('christophe')
    ProposalPage.visitCollectStepPage({
      project: 'budget-participatif-dorganisation',
      step: 'collecte-des-propositions-privee',
    })
    cy.get('.proposal-preview-list')
      .should('be.visible')
      .children()
      .should('have.length', 2)
      .should('contain', 'Proposition de Valérie')
  })
  it('should be possible to see only my proposal as not a member of an organization', () => {
    cy.directLoginAs('user')
    ProposalPage.visitCollectStepPage({
      project: 'budget-participatif-dorganisation',
      step: 'collecte-des-propositions-privee',
    })
    cy.get('.proposal-preview-list')
      .should('be.visible')
      .children()
      .should('have.length', 1)
      .should('not.contain', 'Proposition de Valérie')
  })
})
