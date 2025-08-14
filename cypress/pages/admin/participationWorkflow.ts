export default new (class AdminCollectStepPage {
  get cy() {
    return cy
  }

  consentPrivacyPolicy(isAnonymous: boolean) {
    AdminCollectStepPage.interceptUpdateContributorMutation(isAnonymous)
    cy.contains('participation-workflow.consentPrivacyPolicy')
    cy.contains('i-accept').click({ force: true })
    AdminCollectStepPage.waitUpdateContributorMutation(isAnonymous)
  }

  fillName({ isAnonymous, firstname, lastname }: { isAnonymous: boolean; firstname?: string; lastname?: string }) {
    AdminCollectStepPage.interceptUpdateContributorMutation(isAnonymous)
    if (firstname) {
      cy.get('input[name="firstname"]').clear().type(firstname)
    }
    if (lastname) {
      cy.get('input[name="lastname"]').clear().type(lastname)
    }
    this.submitStep()
    AdminCollectStepPage.waitUpdateContributorMutation(isAnonymous)
  }
  fillBirthDate({ isAnonymous, date }: { isAnonymous: boolean; date: string }) {
    AdminCollectStepPage.interceptUpdateContributorMutation(isAnonymous)
    cy.get('[type="date"]').clear().type(date)
    this.submitStep()
    AdminCollectStepPage.waitUpdateContributorMutation(isAnonymous)
  }
  fillEmail({ email }: { email: string }) {
    cy.get('#email').clear().type(email)
    this.submitStep()
  }

  sendParticipantEmailWorkflowMutation({ email, isAnonymous }: { email: string; isAnonymous: boolean }) {
    cy.interceptGraphQLOperation({ operationName: 'SendParticipantEmailWorkflowMutation' })
    this.fillEmail({
      email,
    })
    cy.contains('participation-workflow.verification')
    cy.confirmCaptcha()
    cy.wait('@SendParticipantEmailWorkflowMutation')
  }

  fillPostalAddress({ isAnonymous, address }: { isAnonymous: boolean; address: string }) {
    AdminCollectStepPage.interceptUpdateContributorMutation(isAnonymous)
    cy.get('#address').clear().type(address)
    cy.get('.cap-address__dropdown').children().first().click({ force: true })
    cy.wait(200)
    this.submitStep()
    AdminCollectStepPage.waitUpdateContributorMutation(isAnonymous)
  }
  fillPhoneNumber({
    number,
    isAnonymous,
    isSendingSms,
    waitForRequirements = false,
  }: {
    number: string
    isAnonymous: boolean
    isSendingSms: boolean
    waitForRequirements?: boolean
  }) {
    if (waitForRequirements) {
      cy.url().should('contain', 'https://capco.test/requirements/step/')
      cy.interceptGraphQLOperation({ operationName: 'ParticipationWorkflowModalQuery' })
    }

    if (isAnonymous) {
      cy.interceptGraphQLOperation({ operationName: 'UpdateParticipantMutation' })
      if (isSendingSms) {
        cy.interceptGraphQLOperation(
          { operationName: 'SendParticipantPhoneValidationCodeMutation' },
          {
            statusCode: 200,
            body: {
              data: {
                sendParticipantPhoneValidationCode: {
                  errorCode: null,
                },
              },
            },
          },
        )
      }
    } else {
      cy.interceptGraphQLOperation({ operationName: 'UpdateProfilePersonalDataMutation' })
      if (isSendingSms) {
        cy.interceptGraphQLOperation(
          { operationName: 'SendSmsPhoneValidationCodeMutation' },
          {
            statusCode: 200,
            body: {
              data: {
                sendSmsPhoneValidationCode: {
                  errorCode: null,
                },
              },
            },
          },
        )
      }
    }

    if (waitForRequirements) {
      cy.wait('@ParticipationWorkflowModalQuery')
    }

    cy.get('#phone').clear().type(number)
    this.submitStep()
    if (isAnonymous) {
      cy.wait('@UpdateParticipantMutation')
      if (isSendingSms) {
        cy.wait('@SendParticipantPhoneValidationCodeMutation')
      }
    } else {
      cy.wait('@UpdateProfilePersonalDataMutation')
      if (isSendingSms) {
        cy.wait('@SendSmsPhoneValidationCodeMutation')
      }
    }
  }
  fillSMSCode({ isAnonymous, code }: { isAnonymous: boolean; code: string }) {
    if (isAnonymous) {
      cy.interceptGraphQLOperation({ operationName: 'VerifyParticipantPhoneNumberMutation' })
    }
    cy.get('[name="code"]').clear().type(code)
    this.submitStep()
    if (isAnonymous) {
      cy.wait('@VerifyParticipantPhoneNumberMutation')
    }
  }

  fillZipCode({ isAnonymous, zipCode }: { isAnonymous: boolean; zipCode: string }) {
    AdminCollectStepPage.interceptUpdateContributorMutation(isAnonymous)
    cy.get('[name="zipCode"]').clear().type(zipCode)
    this.submitStep()
    AdminCollectStepPage.waitUpdateContributorMutation(isAnonymous)
  }

  fillIdentificationCode({
    isAnonymous,
    identificationCode = 'GG2AZR54',
    testValidationErrors = false,
  }: {
    isAnonymous: boolean
    identificationCode?: string
    testValidationErrors?: boolean
  }) {
    const input = cy.get('[name="userIdentificationCode"]')

    if (testValidationErrors) {
      const wrongCode = '1DHEIH'
      input.clear().type(wrongCode)
      this.submitStep()
      cy.contains('BAD_CODE')

      const alreadyUsedCode = 'DK2AZ554'
      input.clear().type(alreadyUsedCode)
      this.submitStep()
      cy.contains('CODE_ALREADY_USED')
    }

    AdminCollectStepPage.interceptUpdateContributorMutation(isAnonymous)
    input.clear().type(identificationCode)
    this.submitStep()
    AdminCollectStepPage.waitUpdateContributorMutation(isAnonymous)
  }

  fillCheckboxes({ isAnonymous }: { isAnonymous: boolean }) {
    if (isAnonymous) {
      cy.interceptGraphQLOperation({ operationName: 'UpdateParticipantRequirementMutation' })
    } else {
      cy.interceptGraphQLOperation({ operationName: 'UpdateRequirementMutation' })
    }
    this.cy.contains('check-everything-and-continue').click({ force: true })
    if (isAnonymous) {
      cy.wait('@UpdateParticipantRequirementMutation')
    } else {
      cy.wait('@UpdateRequirementMutation')
    }
  }

  loginWithCredentials({ email, password }: { email: string; password: string }) {
    cy.contains('log-on-to').click({ force: true })
    cy.get('#email').clear().type(email)
    cy.get('#password').clear().type(password)
    cy.contains('global.login_me').click({ force: true })
  }

  loginWithMagicLink({ email }: { email: string }) {
    cy.interceptGraphQLOperation({ operationName: 'SendParticipantEmailWorkflowMutation' })
    cy.contains('log-on-to').click({ force: true })
    cy.get('#email').clear().type(email)
    cy.contains('get-connection-link').click({ force: true })
    cy.contains('global.continue').click({ force: true })
    cy.contains('participation-workflow.verification')
    cy.confirmCaptcha()
    cy.wait('@SendParticipantEmailWorkflowMutation')
  }

  submitStep() {
    cy.get('[type="submit"]').click({ force: true })
  }

  assertSuccess({ contributionType }: { contributionType: 'REPLY' }) {
    cy.contains('participation-workflow.send_answers')
    cy.wait('@ValidateContributionMutation')
    // if (contributionType === 'REPLY') {
    //   cy.contains('your-participation-is-confirmed')
    // }
  }

  assertAlreadyUsedPhoneError() {
    cy.contains('participation-workflow.send_answers')
    cy.wait('@ValidateContributionMutation')
    cy.contains('participation-workflow-generic-error')
  }

  assertRepliesCount({ expected }: { expected: number }) {
    cy.wait('@QuestionnaireStepPageQuery')
    cy.get('#replies-list').children().should('have.length', expected)
  }

  fillConsentInternalCommunicationEmail({ email }: { email: string | null }) {
    cy.interceptGraphQLOperation({ operationName: 'SendParticipantConsentInternalCommunicationEmailMutation' })
    cy.contains('vote_step.participation_validated')

    if (!email) {
      this.cy.contains('back-to-platform').click({ force: true })
      return
    }
    this.fillEmail({
      email,
    })
    cy.wait('@SendParticipantConsentInternalCommunicationEmailMutation')
    cy.contains('consent-internal-comm-email-send')
  }

  consentInternalCommunication() {
    cy.contains('vote_step.participation_validated')
    cy.contains('participation-workflow.yes').click({ force: true })
  }

  private static interceptUpdateContributorMutation(isAnonymous: boolean) {
    if (isAnonymous) {
      cy.interceptGraphQLOperation({ operationName: 'UpdateParticipantMutation' })
    } else {
      cy.interceptGraphQLOperation({ operationName: 'UpdateProfilePersonalDataMutation' })
    }
  }

  private static waitUpdateContributorMutation(isAnonymous: boolean) {
    if (isAnonymous) {
      cy.wait('@UpdateParticipantMutation')
    } else {
      cy.wait('@UpdateProfilePersonalDataMutation')
    }
  }
})()
