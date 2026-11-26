import { ParticipationWorkflowPage, ProposalPage, ProposalVoteListPage } from '~e2e/pages'
import { proposalVoteWorkflowMatrix } from '../../pages/proposal/proposalVoteWorkflowMatrix'
import { setupFeatureFlags } from '../../support/setupFeatureFlags'

const step = { project: 'bp-vote-etape-de-depot', step: 'collecte-des-propositions-vote-parcours-min-3-max-5' }
const stepPath = `/project/${step.project}/collect/${step.step}`
const proposalA = 'proposalWorkflowCollectVoteA'
const proposalB = 'proposalWorkflowCollectVoteB'
const proposalC = 'proposalWorkflowCollectVoteC'
const proposalD = 'proposalWorkflowCollectVoteD'
const firstThreeProposals = ['A', 'B', 'C'].map(letter => `Proposition Collect + Vote ${letter}`)

describe('Collect vote participation contracts', () => {
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

  /** @cypress-status compliant */
  it('resumes the proposal submission workflow after reloading the collect step', () => {
    ProposalPage.visitCollectStepPage(step)
    cy.interceptGraphQLOperation({ operationName: 'CreateProposalMutation' })
    cy.interceptGraphQLOperation({ operationName: 'ParticipationWorkflowModalQuery' })

    cy.get('#add-proposal').should('be.visible').click()
    cy.get('#proposal_title').type('Proposition Cypress à reprendre après rechargement')
    cy.get('#confirm-proposal-create').should('be.enabled').click()

    return cy.wait('@CreateProposalMutation').then(({ response }) => {
      const proposal = response?.body.data.createProposal
      assert.isTrue(proposal?.shouldTriggerWorkflow)
      assert.isString(proposal.proposalId?.id)

      cy.location('search').should(search => {
        const params = new URLSearchParams(search)
        assert.isTrue(params.has('workflow'))
        assert.strictEqual(params.get('contributionId'), proposal.proposalId.id)
      })
      cy.wait('@ParticipationWorkflowModalQuery')
      cy.get('#email').should('be.visible')

      cy.reload()

      cy.wait('@ParticipationWorkflowModalQuery')
        .its('request.body.variables.contributionId')
        .should('equal', proposal.proposalId.id)
      cy.get('#email').should('be.visible')
      cy.get('@CreateProposalMutation.all').should('have.length', 1)
    })
  })

  it('as participant', () => {
    ProposalPage.visitCollectStepPage(step)
    cy.isLoggedOut()
    const isAnonymous = true
    ProposalVoteListPage.castParticipationVotes([proposalA, proposalB, proposalC], stepPath)

    const email = 'participant-proposalCollectVoteWorkflow@gmail.com'

    ParticipationWorkflowPage.sendParticipantEmailWorkflowMutation({
      email,
      isAnonymous,
      mockedTurnstile: true,
    })
    ParticipationWorkflowPage.fillPhoneNumber({
      number: '0609988761',
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
  for (const loginMethod of ['password', 'magic link']) {
    it(`as logged in user through the workflow using ${loginMethod}`, () => {
      ProposalPage.visitCollectStepPage(step)
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
    ProposalPage.visitCollectStepPage(step)
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
      [...firstThreeProposals, 'Proposition Collect + Vote D'],
      { id: 'proposalWorkflowCollectVoteE', title: 'Proposition Collect + Vote E' },
      { id: 'proposalWorkflowCollectVoteF', title: 'Proposition Collect + Vote F' },
    )
  })

  proposalVoteWorkflowMatrix('collect', step)
})
