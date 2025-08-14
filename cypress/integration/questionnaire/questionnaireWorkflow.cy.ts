import { QuestionnairePage, ParticipationWorkflowPage, ProjectHeaderPage } from '~e2e/pages'

describe('Questionnaire workflow as anonymous', () => {
  beforeEach(() => {
    cy.task('db:restore')
    cy.task('enable:feature', 'turnstile_captcha')
  })
  it('should add / edit / delete a reply in a questionnaire with requirements as anonymous', () => {
    const isAnonymous = true
    QuestionnairePage.visitAnonymousQuestionnaire()
    QuestionnairePage.fillAnonymousQuestionnaire()
    QuestionnairePage.submitForm({
      isAnonymous,
      waitForRequirements: true,
    })

    cy.interceptGraphQLOperation({ operationName: 'ValidateContributionMutation' })

    ParticipationWorkflowPage.sendParticipantEmailWorkflowMutation({
      email: 'johndoe@gmail.com',
      isAnonymous,
    })
    ParticipationWorkflowPage.fillPhoneNumber({
      number: '0601010101',
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
    ParticipationWorkflowPage.assertSuccess({ contributionType: 'REPLY' })
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
    cy.wait('@DeleteAnonymousReplyMutation')
    QuestionnairePage.assertToast('delete')
    cy.get('.list-group').should('not.exist')
  })
  it('should reply a questionnaire with requirements as logged in user', () => {
    const isAnonymous = false
    cy.directLoginAs('pierre')
    QuestionnairePage.visitAnonymousQuestionnaire()
    QuestionnairePage.fillAnonymousQuestionnaire()
    QuestionnairePage.submitForm({
      isAnonymous,
      waitForRequirements: true,
    })

    cy.interceptGraphQLOperation({ operationName: 'ValidateContributionMutation' })

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
    ParticipationWorkflowPage.fillIdentificationCode({
      isAnonymous,
      testValidationErrors: true,
    })
    ParticipationWorkflowPage.fillCheckboxes({
      isAnonymous,
    })

    ParticipationWorkflowPage.assertSuccess({ contributionType: 'REPLY' })
    ParticipationWorkflowPage.consentInternalCommunication()
  })
  it('should reply a questionnaire with requirements by loggin in with email/password through the workflow', () => {
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
      number: '0601010101',
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

    ParticipationWorkflowPage.assertSuccess({ contributionType: 'REPLY' })
    ParticipationWorkflowPage.consentInternalCommunication()
    ParticipationWorkflowPage.assertRepliesCount({
      expected: 1,
    })
  })
  it('should reply a questionnaire with requirements by loggin in with magic link through the workflow', () => {
    QuestionnairePage.visitAnonymousQuestionnaire()
    QuestionnairePage.fillAnonymousQuestionnaire()
    QuestionnairePage.submitForm({
      isAnonymous: true,
      waitForRequirements: true,
    })

    cy.interceptGraphQLOperation({ operationName: 'ValidateContributionMutation' })

    ParticipationWorkflowPage.loginWithMagicLink({
      email: 'pierre@cap-collectif.com',
    })

    const isAnonymous = false
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
    ParticipationWorkflowPage.fillIdentificationCode({
      isAnonymous,
      testValidationErrors: true,
    })
    ParticipationWorkflowPage.fillCheckboxes({
      isAnonymous,
    })

    ParticipationWorkflowPage.assertSuccess({ contributionType: 'REPLY' })
    ParticipationWorkflowPage.consentInternalCommunication()
    ParticipationWorkflowPage.assertRepliesCount({
      expected: 1,
    })
  })
  it('should reply a questionnaire multiple times with requirements by magic link through the workflow', () => {
    QuestionnairePage.visitAnonymousQuestionnaire()
    QuestionnairePage.fillAnonymousQuestionnaire()
    QuestionnairePage.submitForm({
      isAnonymous: true,
      waitForRequirements: true,
    })

    cy.interceptGraphQLOperation({ operationName: 'ValidateContributionMutation' })
    cy.interceptGraphQLOperation({ operationName: 'QuestionnaireStepPageQuery' })

    // the user has already an account, so they should receive a magic link instead of a participant validation email
    ParticipationWorkflowPage.sendParticipantEmailWorkflowMutation({
      email: 'lbrunet@cap-collectif.com',
      isAnonymous: true,
    })
    ParticipationWorkflowPage.fillPhoneNumber({
      number: '0601010101',
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

    ParticipationWorkflowPage.assertSuccess({ contributionType: 'REPLY' })

    // the questionnaire allows multiple replies, so we should assert that the user has 2 replies
    ParticipationWorkflowPage.assertRepliesCount({
      expected: 2,
    })
  })
  it('should display already used phone error message when using a phone already confirmed in another reply', () => {
    const isAnonymous = true
    QuestionnairePage.visitAnonymousQuestionnaire()
    QuestionnairePage.fillAnonymousQuestionnaire()
    QuestionnairePage.submitForm({
      isAnonymous,
      waitForRequirements: true,
    })

    cy.interceptGraphQLOperation({ operationName: 'ValidateContributionMutation' })

    ParticipationWorkflowPage.sendParticipantEmailWorkflowMutation({
      email: 'johndoe@gmail.com',
      isAnonymous,
    })
    ParticipationWorkflowPage.fillPhoneNumber({
      number: '0602020202',
      isAnonymous,
      isSendingSms: true,
      waitForRequirements: true,
    })
    ParticipationWorkflowPage.fillSMSCode({
      code: '123456',
      isAnonymous,
    })
    cy.contains('phone.already.used.in.this.step')
  })
  it('should reconcile replies as participant when replying twice with the same email and multiple replies are allowed', () => {
    const isAnonymous = true
    QuestionnairePage.visitAnonymousQuestionnaire()
    QuestionnairePage.fillAnonymousQuestionnaire()
    QuestionnairePage.submitForm({
      isAnonymous,
      waitForRequirements: true,
    })

    cy.interceptGraphQLOperation({ operationName: 'ValidateContributionMutation' })

    ParticipationWorkflowPage.sendParticipantEmailWorkflowMutation({
      email: 'johndoe@gmail.com',
      isAnonymous,
    })
    ParticipationWorkflowPage.fillPhoneNumber({
      number: '0601010101',
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

    ParticipationWorkflowPage.assertSuccess({ contributionType: 'REPLY' })
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
      email: 'johndoe@gmail.com',
      isAnonymous,
    })

    ParticipationWorkflowPage.assertRepliesCount({
      expected: 2,
    })
  })
  it('should trigger consentInternalCommunication email form when the step has no requirements', () => {
    cy.task('run:sql', 'DELETE FROM requirement WHERE step_id = "qStepProjectAnonymousQuestionnaire"')
    const isAnonymous = true
    QuestionnairePage.visitAnonymousQuestionnaire()
    QuestionnairePage.fillAnonymousQuestionnaire()
    QuestionnairePage.submitForm({
      isAnonymous,
      waitForRequirements: false,
    })
    ParticipationWorkflowPage.fillConsentInternalCommunicationEmail({ email: 'johndoe@gmail.com' })
  })
  it('should return already contributed error when participant attempt to reply with the same email and multiple replies are NOT allowed ', () => {
    cy.task('run:sql', 'UPDATE questionnaire SET multiple_replies_allowed = 0 WHERE id = "questionnaireAnonymous"')

    const isAnonymous = true
    QuestionnairePage.visitAnonymousQuestionnaire()
    QuestionnairePage.fillAnonymousQuestionnaire()
    QuestionnairePage.submitForm({
      isAnonymous,
      waitForRequirements: true,
    })

    cy.interceptGraphQLOperation({ operationName: 'ValidateContributionMutation' })

    ParticipationWorkflowPage.sendParticipantEmailWorkflowMutation({
      email: 'johndoe@gmail.com',
      isAnonymous,
    })
    ParticipationWorkflowPage.fillPhoneNumber({
      number: '0601010101',
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

    ParticipationWorkflowPage.assertSuccess({ contributionType: 'REPLY' })
    ParticipationWorkflowPage.consentInternalCommunication()

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
      email: 'johndoe@gmail.com',
      isAnonymous,
    })

    cy.contains('participant-already-contributed-title')
  })
})

describe('Counters', () => {
  beforeEach(() => {
    cy.task('db:restore')
    cy.task('enable:feature', 'turnstile_captcha')
  })
  it('participant | requirements: YES', () => {
    cy.task('run:sql', 'DELETE FROM requirement WHERE step_id = "qStepProjectAnonymousQuestionnaire"')
    cy.task(
      'run:sql',
      'INSERT INTO requirement (id, step_id, type, label, position) VALUES ("requirement_test", "qStepProjectAnonymousQuestionnaire", "DATE_OF_BIRTH", null, 2)',
    )
    const isAnonymous = true
    QuestionnairePage.visitAnonymousQuestionnaire()
    QuestionnairePage.fillAnonymousQuestionnaire()
    QuestionnairePage.submitForm({
      isAnonymous,
      waitForRequirements: true,
    })
    ParticipationWorkflowPage.fillBirthDate({
      isAnonymous,
      date: '1990-01-01',
    })
    ParticipationWorkflowPage.fillConsentInternalCommunicationEmail({ email: null })
    ProjectHeaderPage.getProjectContributionsCounter().contains('5')
    ProjectHeaderPage.getProjectContributorsCounter().contains('4')

    QuestionnairePage.clickOnDeleteReplyModalButton()
    QuestionnairePage.clickOnDeleteReplyConfirmationButton()
    ProjectHeaderPage.getProjectContributionsCounter().contains('4')
    ProjectHeaderPage.getProjectContributorsCounter().contains('3')
  })
  it('participant | requirements: NO', () => {
    {
      cy.task('run:sql', 'DELETE FROM requirement WHERE step_id = "qStepProjectAnonymousQuestionnaire"')
      const isAnonymous = true
      QuestionnairePage.visitAnonymousQuestionnaire()
      QuestionnairePage.fillAnonymousQuestionnaire()
      QuestionnairePage.submitForm({
        isAnonymous,
        waitForRequirements: false,
      })
      ParticipationWorkflowPage.fillConsentInternalCommunicationEmail({ email: null })
      ProjectHeaderPage.getProjectContributionsCounter().contains('5')
      ProjectHeaderPage.getProjectContributorsCounter().contains('4')

      QuestionnairePage.clickOnDeleteReplyModalButton()
      QuestionnairePage.clickOnDeleteReplyConfirmationButton()
      ProjectHeaderPage.getProjectContributionsCounter().contains('4')
      ProjectHeaderPage.getProjectContributorsCounter().contains('3')
    }
  })
  it('user | requirements: YES', () => {
    cy.task('run:sql', 'UPDATE fos_user SET consent_internal_communication = 1 WHERE id = "userKiroule"')
    cy.task('run:sql', 'DELETE FROM requirement WHERE step_id = "qStepProjectAnonymousQuestionnaire"')
    cy.task(
      'run:sql',
      'INSERT INTO requirement (id, step_id, type, label, position) VALUES ("requirement_test", "qStepProjectAnonymousQuestionnaire", "DATE_OF_BIRTH", null, 2)',
    )
    cy.directLoginAs('pierre')
    const isAnonymous = false
    QuestionnairePage.visitAnonymousQuestionnaire()
    QuestionnairePage.fillAnonymousQuestionnaire()
    QuestionnairePage.submitForm({
      isAnonymous,
      waitForRequirements: true,
    })
    ParticipationWorkflowPage.fillBirthDate({
      isAnonymous,
      date: '1990-01-01',
    })
    ProjectHeaderPage.getProjectContributionsCounter().contains('5')
    ProjectHeaderPage.getProjectContributorsCounter().contains('4')

    QuestionnairePage.clickOnDeleteReplyModalButton()
    QuestionnairePage.clickOnDeleteReplyConfirmationButton()
    ProjectHeaderPage.getProjectContributionsCounter().contains('4')
    ProjectHeaderPage.getProjectContributorsCounter().contains('3')
  })
  it('user | requirements: NO', () => {
    cy.task('run:sql', 'UPDATE fos_user SET consent_internal_communication = 1 WHERE id = "userKiroule"')
    cy.task('run:sql', 'DELETE FROM requirement WHERE step_id = "qStepProjectAnonymousQuestionnaire"')
    cy.directLoginAs('pierre')
    const isAnonymous = false
    QuestionnairePage.visitAnonymousQuestionnaire()
    QuestionnairePage.fillAnonymousQuestionnaire()
    QuestionnairePage.submitForm({
      isAnonymous,
      waitForRequirements: false,
    })
    ProjectHeaderPage.getProjectContributionsCounter().contains('5')
    ProjectHeaderPage.getProjectContributorsCounter().contains('4')

    QuestionnairePage.clickOnDeleteReplyModalButton()
    QuestionnairePage.clickOnDeleteReplyConfirmationButton()
    ProjectHeaderPage.getProjectContributionsCounter().contains('4')
    ProjectHeaderPage.getProjectContributorsCounter().contains('3')
  })
})
