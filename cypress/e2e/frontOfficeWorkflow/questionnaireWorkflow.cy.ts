import { QuestionnairePage, ParticipationWorkflowPage } from '~e2e/pages'
import { setupFeatureFlags } from '../../support/setupFeatureFlags'

// Reconciliation contracts are covered in PHPUnit; see user-tests-audit.md.

// Each suite has one scenario; retries must also start with restored data.

describe('Questionnaire participation contracts: should add / edit / delete a reply in a questionnaire with requirements as anonymous', () => {
  setupFeatureFlags({ turnstile_captcha: true })

  beforeEach(() => {
    cy.task('db:restore')
  })

  after(() => {
    cy.task('db:restore')
  })

  it('should add / edit / delete a reply in a questionnaire with requirements as anonymous', () => {
    const isAnonymous = true
    const email = 'participant-questionnaireWorkflow@gmail.com'
    QuestionnairePage.visitAnonymousQuestionnaire()
    QuestionnairePage.fillAnonymousQuestionnaire()
    QuestionnairePage.submitForm({
      isAnonymous,
      waitForRequirements: true,
    })

    cy.interceptGraphQLOperation({ operationName: 'ValidateContributionMutation' })

    ParticipationWorkflowPage.sendParticipantEmailWorkflowMutation({
      email,
      isAnonymous,
    })
    ParticipationWorkflowPage.fillPhoneNumber({
      number: '0609988763',
      isAnonymous,
      isSendingSms: true,
      waitForRequirements: true,
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
    ParticipationWorkflowPage.fillIdentificationCode({
      isAnonymous,
      testValidationErrors: true,
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
    ParticipationWorkflowPage.consentInternalCommunication()
    ParticipationWorkflowPage.assertRepliesCount({
      expected: 1,
    })

    QuestionnairePage.clickOnFirstReply()
    QuestionnairePage.fillEditAnonymousQuestionnaire()
    QuestionnairePage.submitForm({ isAnonymous: true, operationType: 'EDIT' })
    QuestionnairePage.assertToast()
    QuestionnairePage.assertRepliesLengthToBe(1)

    cy.interceptGraphQLOperation({ operationName: 'DeleteAnonymousReplyMutation' })
    QuestionnairePage.clickOnDeleteReplyModalButton()
    cy.contains('delete-confirmation').should('exist')
    QuestionnairePage.clickOnDeleteReplyConfirmationButton()
    cy.wait('@DeleteAnonymousReplyMutation').its('response.body.errors').should('not.exist')
    QuestionnairePage.assertToast('delete')
    cy.get('.list-group').should('not.exist')
  })
})

describe('Questionnaire participation contracts: should reply a questionnaire with requirements by logging in with email/password through the workflow', () => {
  setupFeatureFlags({ turnstile_captcha: true })

  beforeEach(() => {
    cy.task('db:restore')
  })

  after(() => {
    cy.task('db:restore')
  })

  it('should reply a questionnaire with requirements by logging in with email/password through the workflow', () => {
    QuestionnairePage.visitAnonymousQuestionnaire()
    QuestionnairePage.fillAnonymousQuestionnaire()
    QuestionnairePage.submitForm({
      isAnonymous: true,
      waitForRequirements: true,
    })

    cy.interceptGraphQLOperation({ operationName: 'ValidateContributionMutation' })

    ParticipationWorkflowPage.loginWithCredentials({
      email: 'pierre@cap-collectif.com',
      password: 'toto',
    })

    ParticipationWorkflowPage.fillPhoneNumber({
      number: '0609988763',
      isAnonymous: false,
      isSendingSms: true,
    })
    ParticipationWorkflowPage.fillSMSCode({
      code: '123456',
      isAnonymous: false,
    })
    ParticipationWorkflowPage.consentPrivacyPolicy(false)
    ParticipationWorkflowPage.fillBirthDate({
      isAnonymous: false,
      date: '1990-01-01',
    })
    ParticipationWorkflowPage.fillPostalAddress({
      isAnonymous: false,
      address: '25 rue claude tillier',
    })
    ParticipationWorkflowPage.fillZipCode({
      isAnonymous: false,
      zipCode: '75100',
    })
    ParticipationWorkflowPage.fillIdentificationCode({
      isAnonymous: false,
      testValidationErrors: true,
    })
    ParticipationWorkflowPage.fillCheckboxes({
      isAnonymous: false,
    })
    cy.contains('participation-workflow.no_robot').should('be.visible')
    cy.confirmCaptcha()

    cy.wait('@ValidateContributionMutation').should(({ response }) => {
      assert.equal(response?.statusCode, 200)
      assert.notExists(response?.body.errors)
      assert.isString(response?.body.data?.validateContribution?.redirectUrl)
      assert.isNotEmpty(response?.body.data?.validateContribution?.redirectUrl)
    })
    ParticipationWorkflowPage.consentInternalCommunication()
    ParticipationWorkflowPage.assertRepliesCount({
      expected: 1,
    })
  })
})

describe('Questionnaire participation contracts: should reconcile replies as participant when replying twice with the same email and multiple replies are allowed', () => {
  setupFeatureFlags({ turnstile_captcha: true })

  beforeEach(() => {
    cy.task('db:restore')
  })

  after(() => {
    cy.task('db:restore')
  })

  it('should reconcile replies as participant when replying twice with the same email and multiple replies are allowed', () => {
    const isAnonymous = true
    const email = 'participant-questionnaireWorkflow@gmail.com'
    QuestionnairePage.visitAnonymousQuestionnaire()
    QuestionnairePage.fillAnonymousQuestionnaire()
    QuestionnairePage.submitForm({
      isAnonymous,
      waitForRequirements: true,
    })

    cy.interceptGraphQLOperation({ operationName: 'ValidateContributionMutation' })

    ParticipationWorkflowPage.sendParticipantEmailWorkflowMutation({
      email,
      isAnonymous,
    })
    ParticipationWorkflowPage.fillPhoneNumber({
      number: '0609988763',
      isAnonymous,
      isSendingSms: true,
      waitForRequirements: true,
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
    ParticipationWorkflowPage.fillIdentificationCode({
      isAnonymous,
      testValidationErrors: true,
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
    ParticipationWorkflowPage.consentInternalCommunication()
    ParticipationWorkflowPage.assertRepliesCount({
      expected: 1,
    })

    cy.clearCookie('CapcoParticipant')
    cy.clearCookie('CapcoAnonReply')

    QuestionnairePage.visitAnonymousQuestionnaire()
    QuestionnairePage.fillAnonymousQuestionnaire()
    QuestionnairePage.submitForm({
      isAnonymous,
      waitForRequirements: true,
    })

    cy.interceptGraphQLOperation({ operationName: 'ValidateContributionMutation' })

    ParticipationWorkflowPage.sendParticipantEmailWorkflowMutation({
      email,
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

    ParticipationWorkflowPage.assertRepliesCount({
      expected: 2,
    })
  })
})
