import { ProposalPage } from '~e2e-pages/index'

context('Proposal Page', () => {
  describe('Project Page FO', () => {
    beforeEach(() => {
      cy.task('db:restore')
      cy.task('disable:feature', 'new_vote_step')
    })
    afterEach(() => {
      cy.task('disable:feature', 'blog')
      cy.task('disable:feature', 'captcha')
      cy.task('disable:feature', 'districts')
      cy.task('disable:feature', 'reporting')
      cy.task('disable:feature', 'share_buttons')
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
      cy.interceptGraphQLOperation({ operationName: 'FollowProposalMutation' })
      cy.interceptGraphQLOperation({ operationName: 'UpdateFollowProposalMutation' })
      cy.interceptGraphQLOperation({ operationName: 'UnfollowProposalMutation' })
      ProposalPage.visitProposalPage()
      cy.get('#proposal-follow-btn-UHJvcG9zYWw6cHJvcG9zYWwy').click() //follow
      cy.wait('@FollowProposalMutation')
      cy.get('#proposal-follow-btn-UHJvcG9zYWw6cHJvcG9zYWwy').click() //open menu
      cy.get('.cap-menu__list') // expect menu
      cy.get('.cap-menu__list #proposal-follow-btn-minimal-UHJvcG9zYWw6cHJvcG9zYWwy input').should('be.checked') // check minimal is checked
      // essential
      cy.get('#proposal-follow-btn-UHJvcG9zYWw6cHJvcG9zYWwy').click() // close menu
      cy.get('#proposal-follow-btn-UHJvcG9zYWw6cHJvcG9zYWwy').click() // open menu
      cy.get('.cap-menu__list #proposal-follow-btn-essential-UHJvcG9zYWw6cHJvcG9zYWwy input').check({ force: true }) //check essential
      cy.wait('@UpdateFollowProposalMutation')
      cy.get('#proposal-follow-btn-UHJvcG9zYWw6cHJvcG9zYWwy').click() // open menu
      cy.get('.cap-menu__list #proposal-follow-btn-essential-UHJvcG9zYWw6cHJvcG9zYWwy input').should('be.checked') // check essential is checked
      ProposalPage.visitProposalPage()
      cy.get('#proposal-follow-btn-UHJvcG9zYWw6cHJvcG9zYWwy').click()
      cy.get('.cap-menu__list #proposal-follow-btn-essential-UHJvcG9zYWw6cHJvcG9zYWwy input').should('be.checked')
      //ALL
      cy.get('#proposal-follow-btn-UHJvcG9zYWw6cHJvcG9zYWwy').click() // close menu
      cy.get('#proposal-follow-btn-UHJvcG9zYWw6cHJvcG9zYWwy').click() // open menu
      cy.get('.cap-menu__list').should('be.visible')
      cy.get('.cap-menu__list #proposal-follow-btn-all-UHJvcG9zYWw6cHJvcG9zYWwy input').check({ force: true }) //check all
      cy.wait('@UpdateFollowProposalMutation')
      cy.get('#proposal-follow-btn-UHJvcG9zYWw6cHJvcG9zYWwy').click() // open menu
      cy.get('.cap-menu__list #proposal-follow-btn-all-UHJvcG9zYWw6cHJvcG9zYWwy input').should('be.checked') // check all is checked
      // check if in follower list
      cy.get('#proposal-page-tabs-tab-followers').click()
      cy.get('#proposal-page-tabs-pane-followers').contains('Théo QP')

      cy.get('#proposal-follow-btn-UHJvcG9zYWw6cHJvcG9zYWwy').click()
      cy.get('.proposal__unfollow').click()
      cy.wait('@UnfollowProposalMutation')
      ProposalPage.visitProposalPage()
      cy.get('#proposal-page-tabs-tab-followers').click()
      cy.get('#proposal-page-tabs-pane-followers').should('not.contain', 'Théo QP')
    })

    it('keeps proposal preview follow settings after revisiting the collect step', () => {
      const proposalId = 'UHJvcG9zYWw6cHJvcG9zYWwyMg=='
      const followButton = `[id="proposal-follow-btn-${proposalId}"]`
      const essentialOption = `[id="proposal-follow-btn-essential-${proposalId}"] input`
      const allOption = `[id="proposal-follow-btn-all-${proposalId}"] input`
      const minimalOption = `[id="proposal-follow-btn-minimal-${proposalId}"] input`
      const unfollowButton = `[id="proposal-unfollow-btn-${proposalId}"]`

      cy.directLoginAs('user')
      cy.interceptGraphQLOperation({ operationName: 'FollowProposalMutation' })
      cy.interceptGraphQLOperation({ operationName: 'UpdateFollowProposalMutation' })
      cy.interceptGraphQLOperation({ operationName: 'UnfollowProposalMutation' })

      ProposalPage.visitCollectStepPage({
        project: 'budget-participatif-rennes',
        step: 'depot-avec-vote',
      })
      cy.get(`.proposal-preview-list ${followButton}`).should('be.visible').click()
      cy.wait('@FollowProposalMutation')
      cy.get(`.proposal-preview-list ${followButton}`).click()
      cy.get(essentialOption).check({ force: true })
      cy.wait('@UpdateFollowProposalMutation')

      ProposalPage.visitCollectStepPage({
        project: 'budget-participatif-rennes',
        step: 'depot-avec-vote',
      })
      cy.get(`.proposal-preview-list ${followButton}`).should('contain', 'following').click()
      cy.get(essentialOption).should('be.checked')
      cy.get(allOption).check({ force: true })
      cy.wait('@UpdateFollowProposalMutation')
      cy.get(`.proposal-preview-list ${followButton}`).click()
      cy.get(minimalOption).check({ force: true })
      cy.wait('@UpdateFollowProposalMutation')
      cy.get(`.proposal-preview-list ${followButton}`).click()
      cy.get(unfollowButton).click()
      cy.wait('@UnfollowProposalMutation')

      ProposalPage.visitCollectStepPage({
        project: 'budget-participatif-rennes',
        step: 'depot-avec-vote',
      })
      cy.get(`.proposal-preview-list ${followButton}`).should('contain', 'follow').and('not.contain', 'following')
    })

    it('does not redirect a true unfollow token to followed proposals', () => {
      cy.visit('/profile/notifications/user-unsubscribe-token')

      cy.location('pathname').should('eq', '/profile/edit-profile')
    })

    it('opens login for an anonymous visitor who wants to follow a proposal', () => {
      cy.clearCookies()
      cy.clearLocalStorage()
      ProposalPage.visitProposalPage()

      cy.get('#proposal-follow-btn-UHJvcG9zYWw6cHJvcG9zYWwy').click()
      cy.get('#login-popover').should('be.visible')
    })
    it('allows a logged-in user to comment a proposal', () => {
      cy.directLoginAs('user')
      cy.interceptGraphQLOperation({ operationName: 'AddCommentMutation' })
      ProposalPage.visitProposalPage()

      cy.get('[name="body"]').should('be.visible').type('Commentaire Cypress')
      cy.contains('comment.submit').should('be.visible').click({ force: true })
      cy.wait('@AddCommentMutation')
      cy.contains('.toasts-container--top div', 'comment.submit_success').should('be.visible')
      cy.contains('.comments__section', 'Commentaire Cypress').should('be.visible')
    })
    it('allows an administrator to edit their proposal comment', () => {
      cy.directLoginAs('sfavot')
      ProposalPage.visit({
        project: 'budget-participatif-rennes',
        step: 'collecte-des-propositions',
        stepType: 'collect',
        proposal: 'ravalement-de-la-facade-de-la-bibliotheque-municipale',
      })

      cy.get('#CommentEdit-Q29tbWVudDpwcm9wb3NhbENvbW1lbnQx').should('be.visible').click()
      cy.get('#body').clear().type('Commentaire modifie par Cypress')
      cy.get('#confirm').check({ force: true })
      cy.get('button[type="submit"]').click()
      cy.contains('Commentaire modifie par Cypress').should('be.visible')
    })
    it('allows a user to report a proposal', () => {
      cy.task('enable:feature', 'reporting')
      cy.directLoginAs('admin')
      cy.interceptGraphQLOperation({ operationName: 'ReportMutation' })
      ProposalPage.visitProposalPage()

      cy.get('.proposal__btn--report').should('be.visible').click()
      cy.get('#reportBody').type('Contenu de signalement Cypress')
      cy.get('#reportType').select('reporting.status.spam')
      cy.get('#report-button-submit').should('be.visible').click()
      cy.wait('@ReportMutation')
      cy.contains('.toasts-container--top div', 'alert.success.report.proposal').should('be.visible')
    })
    it('opens the share link modal for anonymous visitors', () => {
      cy.task('enable:feature', 'share_buttons')
      cy.clearCookies()
      cy.clearLocalStorage()
      ProposalPage.visitProposalPage()

      cy.get('#proposal-share-button').should('be.visible').click()
      cy.get('.cap-menu__list.share-button-dropdown').should('contain', 'share.facebook').and('contain', 'share.link')
      cy.get('.share-option').last().click()
      cy.get('.modal--share-link').should('be.visible')
    })
    it('should allow the author of a proposal to update it', () => {
      cy.interceptGraphQLOperation({ operationName: 'ProposalPageQuery' })
      cy.task('enable:feature', 'districts')
      cy.directLoginAs('user')
      cy.interceptGraphQLOperation({ operationName: 'ProposalPageQuery' })
      cy.interceptGraphQLOperation({ operationName: 'ChangeProposalContentMutation' })
      cy.intercept('POST', '**/files').as('uploadDocument')
      ProposalPage.visitProposalPage()
      cy.wait('@ProposalPageQuery')
      cy.get('#proposal-edit-button').click()
      cy.get('#proposal_title').clear().type('Nouveau titre')
      cy.get('#proposal-form-responses3_field').selectFile('fixtures/document.pdf', { force: true })
      cy.wait('@uploadDocument')
      cy.get('#proposal-form-responses3 .document-container').should('contain.text', 'document.pdf')
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
    it('prevents contributions when proposal collection is closed', () => {
      cy.directLoginAs('user')
      ProposalPage.visitCollectStepPage({
        project: 'budget-participatif-rennes',
        step: 'collecte-des-propositions-fermee',
      })

      cy.get('#main').should('contain', 'step.selection.alert.ended.title').and('contain', 'thank.for.contribution')
      cy.get('#add-proposal').should('be.disabled')
    })
    it('opens the proposal form for anonymous visitors who want to contribute', () => {
      cy.clearCookies()
      cy.clearLocalStorage()
      ProposalPage.visitCollectStepPage({
        project: 'budget-participatif-rennes',
        step: 'collecte-des-propositions',
      })

      cy.get('#add-proposal').should('be.visible').click()
      cy.get('#proposal-form').should('exist')
    })
    it('allows an anonymous visitor to comment a proposal', () => {
      cy.task('disable:feature', 'moderation_comment')
      cy.clearCookies()
      cy.clearLocalStorage()
      ProposalPage.visitProposalPage()

      cy.get('#CommentForm').should('be.visible')
      cy.get('textarea[name="body"]').type('Un commentaire Cypress')
      cy.get('input[name="authorName"]').type('Marie Lopez')
      cy.get('input[name="authorEmail"]').type('marie.lopez@example.com')
      cy.interceptGraphQLOperation({ operationName: 'AddCommentMutation' })
      cy.get('#comment-submit').should('be.enabled').click()
      cy.wait('@AddCommentMutation')

      cy.get('#CommentListViewPaginated').should('contain', 'Un commentaire Cypress')
    })
    it('allows a logged-in user to create a proposal with its required information', () => {
      cy.task('enable:feature', 'districts')
      cy.directLoginAs('user')
      cy.interceptGraphQLOperation({ operationName: 'CreateProposalMutation' })
      cy.intercept('POST', '**/files').as('uploadDocument')
      ProposalPage.visitCollectStepPage({
        project: 'budget-participatif-rennes',
        step: 'collecte-des-propositions',
      })

      cy.get('.proposal-preview').should('have.length', 8)
      cy.get('#add-proposal').should('be.visible').click()
      cy.get('#proposal_title').type('Nouvelle proposition Cypress')
      cy.get('#proposal_body .jodit-wysiwyg').type('Description de la proposition Cypress')
      cy.get('#proposal-form-responses1').type('Reponse a la question 1')
      cy.get('#proposal-form-responses2').type('Reponse a la question 2')
      cy.get('[id="global.category"]').select('Politique')
      cy.get('[id="global.theme"]').select('Justice')
      cy.get('#proposal_address').type('5 Allee Rallier-du-Baty 35000 Rennes')
      cy.get('#list-suggestion > li').first().should('be.visible').click()
      cy.get('#proposal_district').select('Beauregard')
      cy.get('#proposal-form-responses3_field').selectFile('fixtures/document.pdf', { force: true })
      cy.wait('@uploadDocument')
      cy.get('#proposal-form-responses3 .document-container').should('contain.text', 'document.pdf')
      cy.get('#confirm-proposal-create').should('be.enabled').click()
      cy.wait('@CreateProposalMutation')
        .its('response.body.data.createProposal.proposal.title')
        .should('equal', 'Nouvelle proposition Cypress')
      cy.contains('.toasts-container--top div', 'proposal.create.redirecting').should('be.visible')
      cy.visit(
        '/project/budget-participatif-rennes/collect/collecte-des-propositions/proposals/nouvelle-proposition-cypress',
      )
      cy.get('#proposal-page-tabs-tab-followers').should('be.visible').click()
      cy.get('#proposal-page-tabs-pane-followers').should('contain', 'user')
    })
    it('shows a validation error when a required response is missing', () => {
      cy.task('enable:feature', 'districts')
      cy.directLoginAs('user')
      ProposalPage.visitCollectStepPage({
        project: 'budget-participatif-rennes',
        step: 'collecte-des-propositions',
      })

      cy.get('#add-proposal').should('be.visible').click()
      cy.get('#proposal_title').type('Proposition incomplete Cypress')
      cy.get('#proposal_body .jodit-wysiwyg').type('Description de la proposition incomplete Cypress')
      cy.get('#proposal-form-responses1').type('Reponse a la question 1')
      cy.get('[id="global.category"]').select('Politique')
      cy.get('#proposal_address').type('5 Allee Rallier-du-Baty 35000 Rennes')
      cy.get('#list-suggestion > li').first().should('be.visible').click()
      cy.get('#proposal_district').select('Beauregard')
      cy.get('#confirm-proposal-create').click({ force: true })
      cy.contains('proposal.constraints.field_mandatory').should('be.visible')

      const beforeUnload = cy.stub()
      cy.on('window:before:unload', beforeUnload)
      cy.reload()
      cy.wrap(beforeUnload).should('have.been.called')
    })
    it('allows an author to delete their proposal', () => {
      cy.directLoginAs('user')
      cy.interceptGraphQLOperation({ operationName: 'DeleteProposalMutation' })
      ProposalPage.visitCollectStepPage({
        project: 'budget-participatif-rennes',
        step: 'collecte-des-propositions',
      })
      cy.get('.proposal-preview').should('have.length', 8)
      ProposalPage.visitProposalPage()

      cy.get('#proposal-delete-button').should('be.visible').click()
      cy.get('#confirm-proposal-delete').should('be.visible').click()
      cy.wait('@DeleteProposalMutation')
      cy.location('pathname').should('include', '/collect/collecte-des-propositions')
      cy.contains('Rénovation du gymnase').should('not.exist')
      cy.get('.proposal-preview').should('have.length', 7)
    })
    describe('proposal news', () => {
      const proposalNewsPath = {
        project: 'budget-participatif-idf',
        step: 'collecte-des-projets-idf-privee',
        stepType: 'collect',
        proposal: 'mon-projet-local-en-tant-quassociation-avec-rna',
      }
      const proposalNewsNotifiablePath = {
        project: 'sauvons-nos-cafes',
        step: 'soutenons-nos-bistros-et-cafes-dans-cette-periode-difficile',
        stepType: 'collect',
        proposal: 'le-petit-cafe',
      }

      beforeEach(() => {
        cy.on('uncaught:exception', err => {
          // ponytail: remove this filter when the duplicated Twig declaration can be fixed.
          if (
            err.name === 'SyntaxError' &&
            err.message.includes("Identifier 'onElementAvailable' has already been declared")
          ) {
            return false
          }
        })
        cy.task('enable:feature', 'blog')
      })

      it('allows an author to create news for their proposal', () => {
        cy.directLoginAs('ian')
        cy.interceptGraphQLOperation({ operationName: 'AddProposalNewsMutation' })
        ProposalPage.visitWithoutVotes(proposalNewsPath)

        cy.get('#add-proposal-news').should('be.visible').click()
        cy.get('#proposal_news_title').type('Une actualite Cypress')
        cy.get('#proposal_news_abstract').type('Un resume Cypress')
        cy.get('#proposal_news_body .jodit-wysiwyg').type('Le contenu de l actualite Cypress')
        cy.get('#confirm-post-create').should('be.enabled').click()
        cy.wait('@AddProposalNewsMutation')
        cy.location('pathname').should('include', '/blog/une-actualite-cypress')
      })

      it('allows an author to update their proposal news', () => {
        cy.directLoginAs('user')
        cy.interceptGraphQLOperation({ operationName: 'UpdateProposalNewsMutation' })
        ProposalPage.visitWithoutVotes(proposalNewsNotifiablePath)
        cy.contains('Remerciment').should('be.visible').click()

        cy.get('#edit-proposal-news').should('be.visible').click()
        cy.get('#proposal_news_abstract').clear().type('Un resume modifie par Cypress')
        cy.get('#confirm-post-edit').should('be.enabled').click()
        cy.wait('@UpdateProposalNewsMutation')
      })

      it('allows an author to delete their proposal news', () => {
        cy.directLoginAs('ian')
        cy.interceptGraphQLOperation({ operationName: 'DeleteProposalNewsMutation' })
        ProposalPage.visitWithoutVotes(proposalNewsPath)

        cy.contains('Mon premier article').should('be.visible').click()
        cy.get('#edit-proposal-news').should('be.visible').click()
        cy.get('#delete-proposal-news').should('be.visible').click()
        cy.get('#confirm-post-delete').should('be.visible').click()
        cy.wait('@DeleteProposalNewsMutation')
        cy.location('pathname').should(
          'include',
          '/project/budget-participatif-idf/collect/collecte-des-projets-idf-privee/proposals/mon-projet-local-en-tant-quassociation-avec-rna',
        )
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
