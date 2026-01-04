import { ProposalPage } from '~e2e-pages/index'

context('Proposal Page', () => {
  describe('Project Page FO', () => {
    beforeEach(() => {
      cy.task('db:restore')
      cy.task('disable:feature', 'new_vote_step')
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
      cy.get('.cap-menu__list #proposal-follow-btn-essential-UHJvcG9zYWw6cHJvcG9zYWwy input').check({ force: true }) //check essential
      cy.wait(1000)
      cy.get('#proposal-follow-btn-UHJvcG9zYWw6cHJvcG9zYWwy').click() // open menu
      cy.get('.cap-menu__list #proposal-follow-btn-essential-UHJvcG9zYWw6cHJvcG9zYWwy input').should('be.checked') // check essential is checked
      //ALL
      cy.get('#proposal-follow-btn-UHJvcG9zYWw6cHJvcG9zYWwy').click() // close menu
      cy.wait(1000)
      cy.get('#proposal-follow-btn-UHJvcG9zYWw6cHJvcG9zYWwy').click() // open menu
      cy.get('.cap-menu__list #proposal-follow-btn-all-UHJvcG9zYWw6cHJvcG9zYWwy input').check({ force: true }) //check all
      cy.wait(1000)
      cy.get('#proposal-follow-btn-UHJvcG9zYWw6cHJvcG9zYWwy').click() // open menu
      cy.get('.cap-menu__list #proposal-follow-btn-all-UHJvcG9zYWw6cHJvcG9zYWwy input').should('be.checked') // check all is checked
      // check if in follower list
      cy.get('#proposal-page-tabs-tab-followers').click()
      cy.get('#proposal-page-tabs-pane-followers').contains('Théo QP')
    })
    it('should allow the author of a proposal to update it', () => {
      cy.interceptGraphQLOperation({ operationName: 'ProposalPageQuery' })
      cy.task('enable:feature', 'districts')
      cy.directLoginAs('user')
      cy.interceptGraphQLOperation({ operationName: 'ProposalPageQuery' })
      cy.interceptGraphQLOperation({ operationName: 'ChangeProposalContentMutation' })
      ProposalPage.visitProposalPage()
      cy.wait('@ProposalPageQuery')
      cy.get('#proposal-edit-button').click()
      cy.get('#proposal_title').clear().type('Nouveau titre')
      cy.get('#proposal-form-responses3_field').selectFile('fixtures/document.pdf', { force: true })
      cy.get('#proposal-form-responses3 .document-container .label > a')
        .scrollIntoView()
        .should('exist')
        .should('be.visible')
        .should('contain', 'document.pdf')
      // eslint-disable-next-line jest/valid-expect-in-promise
      cy.get('#confirm-proposal-edit')
        .click()
        .then(() => {
          cy.wait('@ChangeProposalContentMutation')
          cy.wait('@ProposalPageQuery')
          cy.wait('@ProposalVotesByStepQuery')
          cy.get('h1').should('exist').and('be.visible').should('contain', 'Nouveau titre')
        })
    })
    it('is possible to contact the author of a proposal', () => {
      cy.task('enable:feature', 'captcha')
      cy.interceptGraphQLOperation({ operationName: 'ContactProposalAuthorMutation' })
      ProposalPage.visitContactableProposalPage()
      cy.get('#ProposalContactModal-show-button').click()
      cy.get('#ProposalContactModalForm')
      cy.get('#ProposalFormContactModal-senderName').type('John Doe')
      cy.get('#ProposalFormContactModal-replyEmail').type('john.doe@email.test')
      cy.get('#ProposalFormContactModal-message').type('Hello, I am John Doe')
      // todo: is confirming captcha here necessary to prevent flaking?
      cy.get('#ProposalFormContactModal-submit').click()
      cy.wait('@ContactProposalAuthorMutation')
      cy.contains('message-sent-with-success').should('exist').and('be.visible')
    })
  })
  it('should be possible to see every private proposal as a member of an organization', () => {
    cy.task('disable:feature', 'new_vote_step')
    cy.directLoginAs('christophe')
    ProposalPage.visitCollectStepPage({
      project: 'budget-participatif-dorganisation',
      step: 'collecte-des-propositions-privee',
    })
    cy.get('.proposal-preview-list')
      .should('exist')
      .and('be.visible')
      .children()
      .should('have.length', 2)
      .should('contain', 'Proposition de Valérie')
  })
  it('should be possible to see only my proposal as not a member of an organization', () => {
    cy.task('disable:feature', 'new_vote_step')
    cy.directLoginAs('user')
    ProposalPage.visitCollectStepPage({
      project: 'budget-participatif-dorganisation',
      step: 'collecte-des-propositions-privee',
    })
    cy.get('.proposal-preview-list')
      .should('exist')
      .and('be.visible')
      .children()
      .should('have.length', 1)
      .should('not.contain', 'Proposition de Valérie')
  })
})
