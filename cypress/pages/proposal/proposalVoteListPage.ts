import { toGlobalId } from '~e2e/helper'

type UserAuthenticationState = 'LOGGED_IN' | 'ANONYMOUS'

export default new (class ProposalVoteListPage {
  get cy() {
    return cy
  }

  visitCollectStepWithSmsVoteEnabled() {
    this.cy.interceptGraphQLOperation({ operationName: 'ProposalStepPageQuery' })
    this.cy.interceptGraphQLOperation({ operationName: 'ProposalListViewRefetchQuery' })
    this.cy.visit('project/budget-participatif-idf-3/collect/collecte-vote-par-sms')
    this.cy.wait('@ProposalStepPageQuery', { timeout: 15000 })
    this.cy.wait('@ProposalListViewRefetchQuery', { timeout: 15000 })
  }

  getProposalVoteButton(proposalId: string) {
    const id = toGlobalId('Proposal', proposalId)
    const escapedId = id.replaceAll('=', '\\=')
    return this.cy.get(`#proposal-vote-btn-${escapedId}`)
  }

  getProposalCounter(proposalId: string) {
    const id = toGlobalId('Proposal', proposalId)
    const escapedId = id.replaceAll('=', '\\=')
    return this.cy.get(`#proposal-vote-btn-${escapedId}`)
  }

  getBugdetSpent() {
    return this.cy.get('.budget > :nth-child(1) > .ProposalVoteBasketWidget__InfoContainer-cjKaTk > :nth-child(2)')
  }

  getVotesPointsCounter(proposalId: string) {
    const id = toGlobalId('Proposal', proposalId)
    const escapedId = id.replaceAll('=', '\\=')

    return this.cy.get('body').then($body => {
      const selector = `[data-cy="proposal-points-counter-${id}"]`

      if ($body.find(selector).length) {
        return this.cy.get(selector)
      }

      this.cy.reload()

      return this.cy.get('body').then($bodyAfterReload => {
        if ($bodyAfterReload.find(selector).length) {
          return this.cy.get(selector)
        }

        return this.cy.get(`#cap-proposal-card-${escapedId}`)
      })
    })
  }

  getProjectHeaderVoteCounter() {
    return this.cy.get('#votes-counter-pill')
  }

  getProjectContributorsCounter() {
    return this.cy.get('#contributors-count')
  }

  castParticipationVotes(proposalIds: [string, string, string], resumeOnPath?: string) {
    cy.interceptGraphQLOperation({ operationName: 'AddProposalSmsVoteMutation' })
    cy.interceptGraphQLOperation({ operationName: 'ParticipationWorkflowModalQuery' })

    proposalIds.slice(0, 2).forEach(proposalId => {
      this.participationVoteButton(proposalId).should('be.visible').and('be.enabled').click()
      cy.wait('@AddProposalSmsVoteMutation').then(({ request, response }) => {
        assert.strictEqual(request.body.variables.input.proposalId, toGlobalId('Proposal', proposalId))
        assert.notExists(response?.body.errors)
        assert.isNull(response?.body.data.addProposalSmsVote.errorCode)
        assert.strictEqual(response?.body.data.addProposalSmsVote.vote.completionStatus, 'COMPLETED')
      })
      this.participationVoteButton(proposalId).should('have.attr', 'aria-label', 'global.delete')
    })

    const triggeringProposalId = proposalIds[2]
    this.participationVoteButton(triggeringProposalId).should('be.visible').and('be.enabled').click()
    return cy.wait('@AddProposalSmsVoteMutation').then(({ request, response }) => {
      assert.strictEqual(request.body.variables.input.proposalId, toGlobalId('Proposal', triggeringProposalId))
      assert.notExists(response?.body.errors)
      const result = response?.body.data.addProposalSmsVote
      assert.isNull(result.errorCode)
      assert.strictEqual(result.vote.completionStatus, 'MISSING_REQUIREMENTS')
      const voteId: string = result.vote.id

      return cy.wait('@ParticipationWorkflowModalQuery').then(({ request, response }) => {
        assert.strictEqual(request.body.variables.contributionId, toGlobalId('AbstractVote', voteId))
        assert.notExists(response?.body.errors)
        if (resumeOnPath) {
          this.resumeParticipationVote({ proposalId: triggeringProposalId, voteId, path: resumeOnPath })
        }
      })
    })
  }

  private resumeParticipationVote({ proposalId, voteId, path }: { proposalId: string; voteId: string; path: string }) {
    const otherVoteOperations = [
      'AddProposalVoteMutation',
      'RemoveProposalVoteMutation',
      'RemoveProposalSmsVoteMutation',
    ]
    otherVoteOperations.forEach(operationName => cy.interceptGraphQLOperation({ operationName }))
    cy.interceptGraphQLOperation({ operationName: 'VoteStepQuery', alias: 'VoteStepAfterGivingUp' })

    cy.focused().should('have.attr', 'id', 'email')
    cy.get('button[aria-label="close.participation-workflow.give-up.modal"]')
      .filter(':visible')
      .should('be.enabled')
      .click()
    cy.get('[role="dialog"][aria-label="confirmation-of-withdrawal"]')
      .filter(':visible')
      .contains('a', 'give-up')
      .should('be.visible')
      .click()
    cy.location('pathname').should(pathname => {
      assert.isTrue(pathname.endsWith(path), `Expected ${pathname} to end with ${path}`)
    })
    cy.wait('@VoteStepAfterGivingUp').then(({ response }) => {
      assert.deepInclude(response?.body.data.step.viewerPendingVotes, {
        id: voteId,
        proposal: { id: toGlobalId('Proposal', proposalId) },
      })
    })

    this.participationVoteButton(proposalId).should('be.visible').and('be.enabled').click()
    cy.wait('@ParticipationWorkflowModalQuery').then(({ request, response }) => {
      assert.strictEqual(request.body.variables.contributionId, toGlobalId('AbstractVote', voteId))
      assert.notExists(response?.body.errors)
    })
    cy.get('@AddProposalSmsVoteMutation.all').should('have.length', 3)
    otherVoteOperations.forEach(operationName => cy.get(`@${operationName}.all`).should('have.length', 0))
  }

  openParticipationBallot() {
    cy.get('#change-to-votes-view').scrollIntoView()
    cy.get('#change-to-votes-view').should('be.visible').and('be.enabled').click()
    cy.get('#votes-list').scrollIntoView()
  }

  expectParticipationBallot(titles: string[]) {
    this.openParticipationBallot()
    this.expectBallotContents(titles)
  }

  expectParticipationVoteLimit(
    initialTitles: string[],
    fifth: { id: string; title: string },
    sixth: { id: string; title: string },
  ) {
    this.expectParticipationBallot(initialTitles)
    this.closeParticipationBallot()
    cy.interceptGraphQLOperation({ operationName: 'AddProposalVoteMutation' })
    cy.interceptGraphQLOperation({ operationName: 'RemoveProposalVoteMutation' })

    const fullBallot = [...initialTitles, fifth.title]
    this.castAuthenticatedVote(fifth.id, null)
    this.expectParticipationBallot(fullBallot)
    this.closeParticipationBallot()

    this.castAuthenticatedVote(sixth.id, 'VOTE_LIMIT_REACHED')
    cy.contains(/front\.vote\.error\.limit-reached|nombre maximal de votes/).should('be.visible')
    this.expectParticipationBallot(fullBallot)
    this.closeParticipationBallot()

    this.participationVoteButton(fifth.id).should('have.attr', 'aria-label', 'global.delete')
    this.participationVoteButton(fifth.id).should('be.visible').and('be.enabled').click({ scrollBehavior: 'center' })
    cy.wait('@RemoveProposalVoteMutation').then(({ request, response }) => {
      assert.strictEqual(request.body.variables.input.proposalId, toGlobalId('Proposal', fifth.id))
      assert.notExists(response?.body.errors)
      assert.exists(response?.body.data?.removeProposalVote)
    })
    this.expectParticipationBallot(initialTitles)
    this.closeParticipationBallot()

    this.castAuthenticatedVote(sixth.id, null)
    const updatedBallot = [...initialTitles, sixth.title]
    this.expectParticipationBallot(updatedBallot)

    cy.interceptGraphQLOperation({ operationName: 'VoteStepQuery', alias: 'VoteStepAfterVoteReplacement' })
    cy.reload()
    cy.wait('@VoteStepAfterVoteReplacement')
    this.expectParticipationBallot(updatedBallot)
  }

  private closeParticipationBallot() {
    cy.get('#change-to-votes-view').should('be.visible').click()
    cy.get('#votes-list').should('not.exist')
  }

  private castAuthenticatedVote(proposalId: string, expectedError: 'VOTE_LIMIT_REACHED' | null) {
    this.participationVoteButton(proposalId).should('have.attr', 'aria-label', 'global.add')
    this.participationVoteButton(proposalId).should('be.visible').and('be.enabled').click({ scrollBehavior: 'center' })
    cy.wait('@AddProposalVoteMutation').then(({ request, response }) => {
      assert.strictEqual(request.body.variables.input.proposalId, toGlobalId('Proposal', proposalId))
      assert.notExists(response?.body.errors)
      const result = response?.body.data?.addProposalVote
      assert.strictEqual(result?.errorCode, expectedError)
      if (expectedError === null) {
        assert.strictEqual(result?.vote?.completionStatus, 'COMPLETED')
      }
    })
  }

  private expectBallotContents(titles: string[]) {
    cy.get('#votes-list').should('be.visible').children().should('have.length', titles.length)
    cy.get('#votes-list').within(() => {
      titles.forEach(title => cy.contains(title).should('be.visible'))
    })
  }

  private participationVoteButton(proposalId: string) {
    return cy.getByDataCy(`proposal-vote-button-${toGlobalId('Proposal', proposalId)}`)
  }

  validateSimpleVote(proposalId: string, userAuthenticationState: UserAuthenticationState, hasVotesRanking = false) {
    this.addVoteMutation(userAuthenticationState).intercept()
    if (hasVotesRanking) {
      this.updateVotesMutation(userAuthenticationState).intercept()
    }
    this.getProposalVoteButton(proposalId).click({ force: true })
    this.addVoteMutation(userAuthenticationState).wait()
    if (hasVotesRanking) {
      this.updateVotesMutation(userAuthenticationState).wait()
    }
  }

  deleteVote(proposalId: string, userAuthenticationState: UserAuthenticationState) {
    this.removeVoteMutation(userAuthenticationState).intercept()
    this.getProposalVoteButton(proposalId).click({ force: true })
    this.removeVoteMutation(userAuthenticationState).wait()
  }

  addVoteMutation(type: UserAuthenticationState) {
    const operationNameMap: Record<UserAuthenticationState, string> = {
      LOGGED_IN: 'AddProposalVoteMutation',
      ANONYMOUS: 'AddProposalSmsVoteMutation',
    }

    const operationName = operationNameMap[type]

    return {
      intercept: () => {
        cy.interceptGraphQLOperation({ operationName })
      },
      wait: () => {
        cy.wait(`@${operationName}`)
      },
    }
  }

  updateVotesMutation(type: UserAuthenticationState) {
    const operationNameMap: Record<UserAuthenticationState, string> = {
      LOGGED_IN: 'VotesPopupCardRankingUpdateVotesMutation',
      ANONYMOUS: 'VotesPopupCardRankingUpdateVotesMutation',
    }

    const operationName = operationNameMap[type]

    return {
      intercept: () => {
        cy.interceptGraphQLOperation({ operationName })
      },
      wait: () => {
        cy.wait(`@${operationName}`)
      },
    }
  }

  removeVoteMutation(type: UserAuthenticationState) {
    const operationNameMap: Record<UserAuthenticationState, string> = {
      LOGGED_IN: 'RemoveProposalVoteMutation',
      ANONYMOUS: 'RemoveProposalVoteMutation',
    }

    const operationName = operationNameMap[type]

    return {
      intercept: () => {
        cy.interceptGraphQLOperation({ operationName })
      },
      wait: () => {
        cy.wait(`@${operationName}`)
      },
    }
  }
})()
