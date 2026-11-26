import { toGlobalId } from '~e2e/helper'
import { ParticipationWorkflowPage, ProposalPage, ProposalVoteListPage } from '~e2e/pages'
import { proposalVoteWorkflowMatrix } from '../../pages/proposal/proposalVoteWorkflowMatrix'
import { setupFeatureFlags } from '../../support/setupFeatureFlags'

const step = { project: 'bp-vote-parcours', step: 'vote-parcours-min-3-max-5' }
const stepPath = `/project/${step.project}/selection/${step.step}`
const proposalA = 'proposalWorkflowVoteA'
const proposalB = 'proposalWorkflowVoteB'
const proposalC = 'proposalWorkflowVoteC'
const proposalD = 'proposalWorkflowVoteD'
const firstThreeProposals = ['A', 'B', 'C'].map(letter => `Proposition ${letter}`)

describe('Selection vote participation contracts', () => {
  setupFeatureFlags({ turnstile_captcha: true, new_vote_step: true, new_new_vote_step: true })

  beforeEach(() => {
    cy.viewport(1600, 1000)
    cy.task('db:restore')
    ParticipationWorkflowPage.useMockedGooglePlaces()
    ParticipationWorkflowPage.useMockedTurnstile()
  })

  after(() => {
    cy.task('db:restore')
  })

  it('as participant', () => {
    ProposalPage.visitSelectionStepPage(step)
    cy.isLoggedOut()
    const isAnonymous = true
    ProposalVoteListPage.castParticipationVotes([proposalA, proposalB, proposalC], stepPath)

    const email = 'participant-proposalSelectionVoteWorkflow@gmail.com'

    ParticipationWorkflowPage.sendParticipantEmailWorkflowMutation({
      email,
      isAnonymous,
      mockedTurnstile: true,
    })
    ParticipationWorkflowPage.fillPhoneNumber({
      number: '0609988762',
      isAnonymous,
      isSendingSms: true,
    })
    ParticipationWorkflowPage.fillSMSCode({
      code: '123456',
      isAnonymous,
    })
    ParticipationWorkflowPage.consentPrivacyPolicy(isAnonymous)
    ParticipationWorkflowPage.fillName({
      isAnonymous,
      firstname: 'John',
      lastname: 'Doe',
    })
    ParticipationWorkflowPage.fillBirthDate({
      isAnonymous,
      date: '1990-01-01',
    })
    ParticipationWorkflowPage.fillPostalAddress({
      isAnonymous,
      address: '25 rue claude tillier',
      selectSuggestion: true,
    })
    ParticipationWorkflowPage.fillZipCode({
      isAnonymous,
      zipCode: '75100',
    })
    ParticipationWorkflowPage.finishVoteWorkflow({
      path: stepPath,
      isAnonymous,
      shouldConsent: true,
    })
    ProposalVoteListPage.expectParticipationBallot(firstThreeProposals)
  })
  /**
   * @cypress-status compliant
   * @cypress-reason Checks real vote requests while the first participant response is held in transit.
   */
  it('uses one participant for overlapping anonymous votes and opens the workflow at the minimum', () => {
    const proposalIds = [proposalA, proposalB, proposalC].map(id => toGlobalId('Proposal', id))
    const voteAliases = ['firstAnonymousVote', 'secondAnonymousVote', 'thirdAnonymousVote']
    const extraProposalId = toGlobalId('Proposal', proposalD)
    let extraVoteSent = false
    let firstResponseHeld = false
    let releaseFirstResponse: () => void
    const holdFirstResponse = new Promise<void>(resolve => {
      releaseFirstResponse = resolve
    })

    cy.intercept('POST', '/graphql/internal?operation=AddProposalSmsVoteMutation', request => {
      const id = request.body.variables.input.proposalId
      if (id === extraProposalId) extraVoteSent = true
      const index = proposalIds.indexOf(id)
      if (index === -1) return
      request.alias = voteAliases[index]
      if (index === 0) {
        request.on('response', () => {
          firstResponseHeld = true
          return holdFirstResponse
        })
      }
    })
    cy.interceptGraphQLOperation({ operationName: 'ParticipationWorkflowModalQuery' })
    ProposalPage.visitSelectionStepPage(step)
    cy.getCookie('CapcoParticipant').should('be.null')

    cy.getByDataCy(`proposal-vote-button-${proposalIds[0]}`).should('be.visible').and('be.enabled').click()
    cy.wrap(null).should(() => assert.isTrue(firstResponseHeld))
    for (const id of [...proposalIds.slice(1), extraProposalId]) {
      cy.getByDataCy(`proposal-vote-button-${id}`).should('be.visible').and('be.enabled').click()
    }
    cy.getByDataCy(`proposal-vote-button-${proposalIds[0]}`).should('be.disabled')
    cy.then(() => releaseFirstResponse())

    return cy
      .wait(voteAliases.map(alias => `@${alias}`))
      .then(votes => {
        const participantToken = votes[0].response?.body.data.addProposalSmsVote.participantToken
        assert.isTrue(typeof participantToken === 'string', 'the first vote created a participant')
        assert.notExists(votes[0].request.body.variables.input.token)
        votes.forEach(({ request, response }, index) => {
          assert.notExists(response?.body.errors)
          const result = response?.body.data.addProposalSmsVote
          assert.isNull(result?.errorCode)
          assert.strictEqual(result?.vote.completionStatus, index === 2 ? 'MISSING_REQUIREMENTS' : 'COMPLETED')
          assert.isTrue(result?.participantToken === participantToken, 'all three votes use the same participant')
          if (index > 0) {
            assert.isTrue(request.body.variables.input.token === btoa(participantToken), 'queued vote sends the token')
          }
        })
        return cy
          .wait('@ParticipationWorkflowModalQuery')
          .its('request.body.variables.contributionId')
          .should('eq', toGlobalId('AbstractVote', votes[2].response?.body.data.addProposalSmsVote.vote.id))
      })
      .then(() => cy.get('[role="dialog"]').filter(':visible').find('#email').should('be.visible'))
      .should(() => assert.isFalse(extraVoteSent, 'queued clicks stop when the workflow opens'))
  })

  for (const loginMethod of ['password', 'magic link']) {
    it(`as logged in user through the workflow using ${loginMethod}`, () => {
      ProposalPage.visitSelectionStepPage(step)
      cy.isLoggedOut()
      const isAnonymous = false
      ProposalVoteListPage.castParticipationVotes([proposalA, proposalB, proposalC])

      const email = 'pierre@cap-collectif.com'
      if (loginMethod === 'password') {
        ParticipationWorkflowPage.loginWithCredentials({ email, password: 'toto' })
      } else {
        ParticipationWorkflowPage.loginWithMagicLink({ email })
      }

      ParticipationWorkflowPage.fillPhoneNumber({
        number: '0601010101',
        isAnonymous,
        isSendingSms: true,
      })
      ParticipationWorkflowPage.fillSMSCode({
        code: '123456',
        isAnonymous,
      })
      ParticipationWorkflowPage.consentPrivacyPolicy(isAnonymous)
      ParticipationWorkflowPage.fillBirthDate({
        isAnonymous,
        date: '1990-01-01',
      })
      ParticipationWorkflowPage.fillPostalAddress({
        isAnonymous,
        address: '25 rue claude tillier',
        selectSuggestion: true,
      })
      ParticipationWorkflowPage.fillZipCode({
        isAnonymous,
        zipCode: '75100',
      })
      ParticipationWorkflowPage.finishVoteWorkflow({
        path: stepPath,
        isAnonymous,
        shouldConsent: true,
      })
      ProposalVoteListPage.expectParticipationBallot(firstThreeProposals)
    })
  }

  it('merges ballots and enforces the five-vote limit', () => {
    ProposalPage.visitSelectionStepPage(step)
    cy.isLoggedOut()
    const isAnonymous = false
    ProposalVoteListPage.castParticipationVotes([proposalA, proposalB, proposalD])

    ParticipationWorkflowPage.loginWithCredentials({
      email: 'lbrunet@cap-collectif.com',
      password: 'toto',
    })
    ParticipationWorkflowPage.fillPhoneNumber({
      number: '0601010101',
      isAnonymous,
      isSendingSms: true,
    })
    ParticipationWorkflowPage.fillSMSCode({
      code: '123456',
      isAnonymous,
    })
    ParticipationWorkflowPage.consentPrivacyPolicy(isAnonymous)
    ParticipationWorkflowPage.fillBirthDate({
      isAnonymous,
      date: '1990-01-01',
    })
    ParticipationWorkflowPage.fillPostalAddress({
      isAnonymous,
      address: '25 rue claude tillier',
      selectSuggestion: true,
    })
    ParticipationWorkflowPage.fillZipCode({
      isAnonymous,
      zipCode: '75100',
    })
    ParticipationWorkflowPage.finishVoteWorkflow({
      path: stepPath,
      isAnonymous,
      shouldConsent: false,
    })
    ProposalVoteListPage.expectParticipationVoteLimit(
      [...firstThreeProposals, 'Proposition D'],
      { id: 'proposalWorkflowVoteE', title: 'Proposition E' },
      { id: 'proposalWorkflowVoteF', title: 'Proposition F' },
    )
  })

  proposalVoteWorkflowMatrix('selection', step)
})
