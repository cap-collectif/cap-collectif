export default new (class AdminCollectStepPage {
  get cy() {
    return cy
  }

  useMockedGooglePlaces() {
    // Keep the mock installed by Cypress support when the requirements page loads the Maps script.
    cy.intercept({ method: 'GET', hostname: 'maps.googleapis.com', pathname: '/maps/api/js' }, { body: '' })
  }

  useMockedTurnstile() {
    cy.intercept(
      { method: 'GET', hostname: 'challenges.cloudflare.com', pathname: '/turnstile/v0/api.js' },
      {
        headers: { 'content-type': 'application/javascript' },
        body: `
        window.turnstile = {
          render(container, options) {
            const button = document.createElement('button');
            button.type = 'button';
            button.dataset.cy = 'confirm-test-turnstile';
            button.textContent = 'Confirm test captcha';
            button.addEventListener('click', () => options.callback('cypress-turnstile-token'));
            container.append(button);
            return container.id;
          },
          remove(id) { document.getElementById(id)?.querySelector('[data-cy="confirm-test-turnstile"]')?.remove(); },
          reset() {},
        };
        {
          const onload = document.currentScript.src.split('onload=')[1]?.split('&')[0];
          if (onload) window[decodeURIComponent(onload)]?.();
        }
      `,
      },
    )
  }

  confirmMockedTurnstile() {
    this.activeDialog().find('[data-cy="confirm-test-turnstile"]').should('be.visible').click()
  }

  consentPrivacyPolicy(isAnonymous: boolean) {
    AdminCollectStepPage.interceptUpdateContributorMutation(isAnonymous)
    cy.contains('participation-workflow.consentPrivacyPolicy')
    this.activeDialog().contains('button', 'i-accept').should('be.visible').click()
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

  sendParticipantEmailWorkflowMutation({
    email,
    mockedTurnstile = false,
  }: {
    email: string
    isAnonymous: boolean
    mockedTurnstile?: boolean
  }) {
    cy.interceptGraphQLOperation({ operationName: 'SendParticipantEmailWorkflowMutation' })
    this.fillEmail({
      email,
    })
    cy.contains('participation-workflow.verification').should('be.visible')
    if (mockedTurnstile) this.confirmMockedTurnstile()
    else cy.confirmCaptcha()
    cy.wait('@SendParticipantEmailWorkflowMutation')
  }

  fillPostalAddress({
    isAnonymous,
    address,
    selectSuggestion = false,
  }: {
    isAnonymous: boolean
    address: string
    selectSuggestion?: boolean
  }) {
    const operationName = isAnonymous ? 'UpdateParticipantMutation' : 'UpdateProfilePersonalDataMutation'
    cy.interceptGraphQLOperation({ operationName }, req => {
      if (req.body.variables.input.postalAddress) {
        req.alias = 'UpdatePostalAddressMutation'
      }
    })
    cy.get('#address').clear().type(address)
    if (selectSuggestion) {
      this.activeDialog().find('.cap-address__dropdown').contains(address).should('be.visible').click()
    } else {
      cy.get('body').then($body => {
        if ($body.find('.cap-address__dropdown').length) {
          cy.get('.cap-address__dropdown').children().first().should('be.visible').click({ force: true })
          // The Cypress Google Places mock returns the typed text as the formatted address.
          cy.get('#address').should('not.have.value', '')
        }
      })
    }
    this.submitStep()
    cy.wait('@UpdatePostalAddressMutation').then(({ response }) => {
      assert.notExists(response?.body.errors)
      if (isAnonymous) {
        assert.isNull(response?.body.data.updateParticipant.validationErrors)
      } else {
        assert.isNull(response?.body.data.updateProfilePersonalData.errorCode)
      }
    })
    cy.contains('participation-workflow.zipCode', { timeout: 10000 }).should('be.visible')
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
      cy.wait('@UpdateProfilePersonalDataMutation').then(({ response }) => {
        assert.notExists(response?.body.errors, JSON.stringify(response?.body.errors))
        assert.isNull(response?.body.data.updateProfilePersonalData.errorCode)
      })
      if (isSendingSms) {
        cy.wait('@SendSmsPhoneValidationCodeMutation')
      }
    }
  }
  fillSMSCode({ isAnonymous, code }: { isAnonymous: boolean; code: string }) {
    if (isAnonymous) {
      cy.interceptGraphQLOperation({ operationName: 'VerifyParticipantPhoneNumberMutation' })
    } else {
      cy.interceptGraphQLOperation({ operationName: 'VerifyUserPhoneNumberMutation' })
    }
    cy.get('#code').clear().type(code)
    if (isAnonymous) {
      cy.wait('@VerifyParticipantPhoneNumberMutation')
    } else {
      cy.wait('@VerifyUserPhoneNumberMutation')
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
    this.activeDialog().contains('button', 'check-everything-and-continue').should('be.visible').click()
    if (isAnonymous) {
      cy.wait('@UpdateParticipantRequirementMutation')
    } else {
      cy.wait('@UpdateRequirementMutation')
    }
  }

  loginWithCredentials({ email, password }: { email: string; password: string }) {
    cy.intercept('POST', '/login_check').as('WorkflowLogin')
    cy.interceptGraphQLOperation({ operationName: 'ParticipationWorkflowModalQuery', alias: 'WorkflowAfterLogin' })

    this.activeDialog().contains('button', 'log-on-to').should('be.visible').click()
    cy.get('#email').clear().type(email)
    cy.get('#password').clear().type(password)
    this.activeDialog().contains('button', 'global.login_me').should('be.visible').click()
    cy.wait('@WorkflowLogin').then(({ response }) => {
      assert.strictEqual(response?.statusCode, 200)
      assert.isTrue(response?.body.success)
    })
    cy.wait('@WorkflowAfterLogin').then(({ request, response }) => {
      assert.isTrue(request.body.variables.isAuthenticated)
      assert.notExists(response?.body.errors)
      assert.strictEqual(response?.body.data.viewer?.email, email)
    })
  }

  loginWithMagicLink({ email }: { email: string }) {
    cy.interceptGraphQLOperation({ operationName: 'SendParticipantEmailWorkflowMutation' })
    cy.interceptGraphQLOperation({ operationName: 'ParticipationWorkflowModalQuery', alias: 'WorkflowAfterMagicLink' })

    this.activeDialog().contains('button', 'log-on-to').should('be.visible').click()
    this.activeDialog().contains('button', 'get-connection-link').should('be.visible').click()
    this.fillEmail({ email })
    cy.contains('participation-workflow.verification').should('be.visible')
    this.confirmMockedTurnstile()
    cy.wait('@SendParticipantEmailWorkflowMutation').then(({ request, response }) => {
      assert.strictEqual(request.body.variables.input.emailType, 'MAGIC_LINK')
      assert.notExists(response?.body.errors)
      assert.isNotEmpty(response?.body.data?.sendParticipantEmailWorkflow?.redirectUrl)
    })
    return cy.wait('@WorkflowAfterMagicLink').then(({ request, response }) => {
      assert.isTrue(request.body.variables.isAuthenticated)
      assert.notExists(response?.body.errors)
      assert.strictEqual(response?.body.data.viewer?.email, email)
    })
  }

  submitStep() {
    this.activeDialog().find('button[type="submit"]:visible').should('be.enabled').click()
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

  consentInternalCommunication({ isAnonymous }: { isAnonymous?: boolean } = {}) {
    cy.contains('vote_step.participation_validated', { timeout: 10000 }).should('be.visible')

    if (isAnonymous !== undefined) {
      AdminCollectStepPage.interceptUpdateContributorMutation(isAnonymous)
    }

    this.activeDialog().contains('button', 'participation-workflow.yes').should('be.visible').click()

    if (isAnonymous !== undefined) {
      AdminCollectStepPage.waitUpdateContributorMutation(isAnonymous)
    }
  }

  finishVoteWorkflow({
    isAnonymous,
    path,
    shouldConsent,
  }: {
    isAnonymous: boolean
    path: string
    shouldConsent: boolean
  }) {
    cy.interceptGraphQLOperation({ operationName: 'ValidateContributionMutation' })
    cy.interceptGraphQLOperation({ operationName: 'VoteStepQuery', alias: 'VoteStepAfterValidation' })

    this.fillCheckboxes({ isAnonymous })
    // Email confirmation and login reload the workflow on the legacy requirements route.
    cy.contains('participation-workflow.no_robot').should('be.visible')
    this.confirmMockedTurnstile()
    cy.wait('@ValidateContributionMutation').then(({ response }) => {
      assert.strictEqual(response?.statusCode, 200)
      assert.notExists(response?.body.errors)
      assert.isString(response?.body.data?.validateContribution?.redirectUrl)
      assert.isNotEmpty(response?.body.data?.validateContribution?.redirectUrl)
    })

    if (shouldConsent) {
      this.consentInternalCommunication({ isAnonymous })
    }

    cy.location('pathname').should(pathname => {
      assert.isTrue(pathname.endsWith(path), `Expected ${pathname} to end with ${path}`)
    })
    cy.wait('@VoteStepAfterValidation')
  }

  private activeDialog() {
    return cy.get('[role="dialog"][aria-label="participation-workflow.requirements"]').filter(':visible')
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
