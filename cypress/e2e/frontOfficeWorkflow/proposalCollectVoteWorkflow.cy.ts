import { ParticipationWorkflowPage, ProposalPage, ProposalVoteListPage } from '~e2e/pages'
import { setupFeatureFlags } from '../../support/setupFeatureFlags'

// Algorithmic vote matrices are covered in PHPUnit; see user-tests-audit.md.

// Each suite has one scenario; retries must also start with restored data.

describe('Collect vote participation contracts: as participant', () => {
  setupFeatureFlags({ turnstile_captcha: true })

  beforeEach(() => {
    cy.task('db:restore')
  })

  after(() => {
    cy.task('db:restore')
  })

  it('as participant', () => {
    ProposalPage.visitCollectStepPage({
      project: 'bp-vote-etape-de-depot',
      step: 'collecte-des-propositions-vote-parcours-min-3-max-5',
    })
    cy.isLoggedOut()
    const userAuthenticationState = 'ANONYMOUS'
    const isAnonymous = true
    ProposalVoteListPage.validateVoteMin('proposalWorkflowCollectVoteA', userAuthenticationState)
    ProposalVoteListPage.validateVoteMin('proposalWorkflowCollectVoteB', userAuthenticationState)
    ProposalVoteListPage.validateVoteMin('proposalWorkflowCollectVoteC', userAuthenticationState)

    cy.interceptGraphQLOperation({ operationName: 'ValidateContributionMutation' })

    const email = 'participant-proposalCollectVoteWorkflow@gmail.com'

    ParticipationWorkflowPage.sendParticipantEmailWorkflowMutation({
      email,
      isAnonymous,
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
    })
    ParticipationWorkflowPage.fillZipCode({
      isAnonymous,
      zipCode: '75100',
    })
    ParticipationWorkflowPage.fillCheckboxes({
      isAnonymous,
    })
    cy.contains('participation-workflow.no_robot').should('be.visible')
    cy.confirmCaptcha()

    ParticipationWorkflowPage.consentInternalCommunication()
    cy.wait('@ValidateContributionMutation').should(({ response }) => {
      assert.equal(response?.statusCode, 200)
      assert.notExists(response?.body.errors)
      assert.isString(response?.body.data?.validateContribution?.redirectUrl)
      assert.isNotEmpty(response?.body.data?.validateContribution?.redirectUrl)
    })

    ProposalVoteListPage.getVoteWidgetCounter().should('have.text', '3')
    ProposalVoteListPage.getProposalVoteButton('proposalWorkflowCollectVoteA').contains('voted')
    ProposalVoteListPage.getProposalVoteButton('proposalWorkflowCollectVoteB').contains('voted')
    ProposalVoteListPage.getProposalVoteButton('proposalWorkflowCollectVoteC').contains('voted')
  })
})

describe('Collect vote participation contracts: as logged in user through the workflow using login/password', () => {
  setupFeatureFlags({ turnstile_captcha: true })

  beforeEach(() => {
    cy.task('db:restore')
  })

  after(() => {
    cy.task('db:restore')
  })

  it('as logged in user through the workflow using login/password', () => {
    ProposalPage.visitCollectStepPage({
      project: 'bp-vote-etape-de-depot',
      step: 'collecte-des-propositions-vote-parcours-min-3-max-5',
    })
    cy.isLoggedOut()
    const userAuthenticationState = 'ANONYMOUS'
    const isAnonymous = false
    ProposalVoteListPage.validateVoteMin('proposalWorkflowCollectVoteA', userAuthenticationState)
    ProposalVoteListPage.validateVoteMin('proposalWorkflowCollectVoteB', userAuthenticationState)
    ProposalVoteListPage.validateVoteMin('proposalWorkflowCollectVoteC', userAuthenticationState)

    cy.interceptGraphQLOperation({ operationName: 'ValidateContributionMutation' })

    ParticipationWorkflowPage.loginWithCredentials({
      email: 'pierre@cap-collectif.com',
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
    })
    ParticipationWorkflowPage.fillZipCode({
      isAnonymous,
      zipCode: '75100',
    })
    ParticipationWorkflowPage.fillCheckboxes({
      isAnonymous,
    })
    cy.contains('participation-workflow.no_robot').should('be.visible')
    cy.confirmCaptcha()

    ParticipationWorkflowPage.consentInternalCommunication()
    cy.wait('@ValidateContributionMutation').should(({ response }) => {
      assert.equal(response?.statusCode, 200)
      assert.notExists(response?.body.errors)
      assert.isString(response?.body.data?.validateContribution?.redirectUrl)
      assert.isNotEmpty(response?.body.data?.validateContribution?.redirectUrl)
    })

    ProposalVoteListPage.getVoteWidgetCounter().should('have.text', '3')

    ProposalVoteListPage.getProposalVoteButton('proposalWorkflowCollectVoteA').contains('voted')
    ProposalVoteListPage.getProposalVoteButton('proposalWorkflowCollectVoteB').contains('voted')
    ProposalVoteListPage.getProposalVoteButton('proposalWorkflowCollectVoteC').contains('voted')
  })
})

describe('Collect vote participation contracts: merges participant and user ballots into four distinct votes', () => {
  setupFeatureFlags({ turnstile_captcha: true })

  beforeEach(() => {
    cy.task('db:restore')
  })

  after(() => {
    cy.task('db:restore')
  })

  it('merges participant and user ballots into four distinct votes', () => {
    ProposalPage.visitCollectStepPage({
      project: 'bp-vote-etape-de-depot',
      step: 'collecte-des-propositions-vote-parcours-min-3-max-5',
    })
    cy.isLoggedOut()
    const userAuthenticationState = 'ANONYMOUS'
    const isAnonymous = false
    ProposalVoteListPage.validateVoteMin('proposalWorkflowCollectVoteA', userAuthenticationState)
    ProposalVoteListPage.validateVoteMin('proposalWorkflowCollectVoteB', userAuthenticationState)
    ProposalVoteListPage.validateVoteMin('proposalWorkflowCollectVoteD', userAuthenticationState)

    cy.interceptGraphQLOperation({ operationName: 'ValidateContributionMutation' })

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
    })
    ParticipationWorkflowPage.fillZipCode({
      isAnonymous,
      zipCode: '75100',
    })
    ParticipationWorkflowPage.fillCheckboxes({
      isAnonymous,
    })
    cy.contains('participation-workflow.no_robot').should('be.visible')
    cy.confirmCaptcha()

    cy.wait('@ValidateContributionMutation').should(({ response }) => {
      assert.equal(response?.statusCode, 200)
      assert.notExists(response?.body.errors)
      assert.isString(response?.body.data?.validateContribution?.redirectUrl)
      assert.isNotEmpty(response?.body.data?.validateContribution?.redirectUrl)
    })

    ProposalVoteListPage.getVoteWidgetCounter().should('have.text', '4')

    ProposalVoteListPage.getProposalVoteButton('proposalWorkflowCollectVoteA').contains('voted')
    ProposalVoteListPage.getProposalVoteButton('proposalWorkflowCollectVoteB').contains('voted')
    ProposalVoteListPage.getProposalVoteButton('proposalWorkflowCollectVoteC').contains('voted')
    ProposalVoteListPage.getProposalVoteButton('proposalWorkflowCollectVoteD').contains('voted')
  })
})
