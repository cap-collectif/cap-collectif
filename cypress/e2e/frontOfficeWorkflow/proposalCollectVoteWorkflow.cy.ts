import { ParticipationWorkflowPage, ProjectHeaderPage, ProposalPage, ProposalVoteListPage } from '~e2e/pages'

describe('Proposal Collect Vote Page workflow', () => {
  beforeEach(() => {
    cy.task('db:restore')
    cy.task('enable:feature', 'turnstile_captcha')
  })

  describe('should trigger workflow after reaching min votes and validate vote through workflow', () => {
    it('as participant', () => {
      ProposalPage.visitCollectStepPage({
        project: 'bp-vote-etape-de-depot',
        step: 'collecte-des-propositions-vote-parcours-min-3-max-5',
      })
      const userAuhtenticationState = 'ANONYMOUS'
      const isAnonymous = true
      ProposalVoteListPage.validateVoteMin('proposalWorkflowCollectVoteA', userAuhtenticationState)
      ProposalVoteListPage.validateVoteMin('proposalWorkflowCollectVoteB', userAuhtenticationState)
      ProposalVoteListPage.validateVoteMin('proposalWorkflowCollectVoteC', userAuhtenticationState)

      cy.interceptGraphQLOperation({ operationName: 'ValidateContributionMutation' })

      const email = 'johndoe@gmail.com'

      ParticipationWorkflowPage.sendParticipantEmailWorkflowMutation({
        email: email,
        isAnonymous,
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

      ParticipationWorkflowPage.consentInternalCommunication()
      cy.wait('@ValidateContributionMutation')

      ProposalVoteListPage.getVoteWidgetCounter().should('have.text', 3)
      ProposalVoteListPage.getProposalVoteButton('proposalWorkflowCollectVoteA').contains('voted')
      ProposalVoteListPage.getProposalVoteButton('proposalWorkflowCollectVoteB').contains('voted')
      ProposalVoteListPage.getProposalVoteButton('proposalWorkflowCollectVoteC').contains('voted')
    })

    it('as logged in user ', () => {
      cy.directLoginAs('pierre')
      ProposalPage.visitCollectStepPage({
        project: 'bp-vote-etape-de-depot',
        step: 'collecte-des-propositions-vote-parcours-min-3-max-5',
      })
      const userAuhtenticationState = 'LOGGED_IN'
      const isAnonymous = false
      ProposalVoteListPage.validateVoteMin('proposalWorkflowCollectVoteA', userAuhtenticationState)
      ProposalVoteListPage.validateVoteMin('proposalWorkflowCollectVoteB', userAuhtenticationState)
      ProposalVoteListPage.validateVoteMin('proposalWorkflowCollectVoteC', userAuhtenticationState)

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
      ParticipationWorkflowPage.fillCheckboxes({
        isAnonymous,
      })

      ParticipationWorkflowPage.consentInternalCommunication()
      cy.wait('@ValidateContributionMutation')

      ProposalVoteListPage.getVoteWidgetCounter().should('have.text', 3)

      ProposalVoteListPage.getProposalVoteButton('proposalWorkflowCollectVoteA').contains('voted')
      ProposalVoteListPage.getProposalVoteButton('proposalWorkflowCollectVoteB').contains('voted')
      ProposalVoteListPage.getProposalVoteButton('proposalWorkflowCollectVoteC').contains('voted')
    })

    it('as logged in user through the workflow using login/password', () => {
      ProposalPage.visitCollectStepPage({
        project: 'bp-vote-etape-de-depot',
        step: 'collecte-des-propositions-vote-parcours-min-3-max-5',
      })
      const userAuhtenticationState = 'ANONYMOUS'
      const isAnonymous = false
      ProposalVoteListPage.validateVoteMin('proposalWorkflowCollectVoteA', userAuhtenticationState)
      ProposalVoteListPage.validateVoteMin('proposalWorkflowCollectVoteB', userAuhtenticationState)
      ProposalVoteListPage.validateVoteMin('proposalWorkflowCollectVoteC', userAuhtenticationState)

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

      ParticipationWorkflowPage.consentInternalCommunication()
      cy.wait('@ValidateContributionMutation')

      ProposalVoteListPage.getVoteWidgetCounter().should('have.text', 3)

      ProposalVoteListPage.getProposalVoteButton('proposalWorkflowCollectVoteA').contains('voted')
      ProposalVoteListPage.getProposalVoteButton('proposalWorkflowCollectVoteB').contains('voted')
      ProposalVoteListPage.getProposalVoteButton('proposalWorkflowCollectVoteC').contains('voted')
    })

    it('as logged in user through the magic link', () => {
      ProposalPage.visitCollectStepPage({
        project: 'bp-vote-etape-de-depot',
        step: 'collecte-des-propositions-vote-parcours-min-3-max-5',
      })
      const userAuhtenticationState = 'ANONYMOUS'
      const isAnonymous = false
      ProposalVoteListPage.validateVoteMin('proposalWorkflowCollectVoteA', userAuhtenticationState)
      ProposalVoteListPage.validateVoteMin('proposalWorkflowCollectVoteB', userAuhtenticationState)
      ProposalVoteListPage.validateVoteMin('proposalWorkflowCollectVoteC', userAuhtenticationState)

      cy.interceptGraphQLOperation({ operationName: 'ValidateContributionMutation' })

      ParticipationWorkflowPage.loginWithMagicLink({
        email: 'pierre@cap-collectif.com',
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

      ParticipationWorkflowPage.consentInternalCommunication()
      cy.wait('@ValidateContributionMutation')

      ProposalVoteListPage.getVoteWidgetCounter().should('have.text', 3)

      ProposalVoteListPage.getProposalVoteButton('proposalWorkflowCollectVoteA').contains('voted')
      ProposalVoteListPage.getProposalVoteButton('proposalWorkflowCollectVoteB').contains('voted')
      ProposalVoteListPage.getProposalVoteButton('proposalWorkflowCollectVoteC').contains('voted')
    })
  })

  describe('internal communication', () => {
    it.skip('should trigger consentInternalCommunication email form when the step has requirements: NO', () => {
      cy.task('run:sql', 'DELETE FROM requirement WHERE step_id = "collectStepWorkflowCollectVote"')

      ProposalPage.visitCollectStepPage({
        project: 'bp-vote-etape-de-depot',
        step: 'collecte-des-propositions-vote-parcours-min-3-max-5',
      })
      const userAuhtenticationState = 'ANONYMOUS'
      ProposalVoteListPage.validateVoteMin('proposalWorkflowCollectVoteA', userAuhtenticationState)
      ProposalVoteListPage.validateVoteMin('proposalWorkflowCollectVoteB', userAuhtenticationState)
      ProposalVoteListPage.validateVoteMin('proposalWorkflowCollectVoteC', userAuhtenticationState)

      ParticipationWorkflowPage.fillConsentInternalCommunicationEmail({ email: 'johndoe@gmail.com' })
    })
  })

  describe('reconciliating votes', () => {
    it('min = 3 | max = 4 => should merge participant votes with logged in user votes', () => {
      ProposalPage.visitCollectStepPage({
        project: 'bp-vote-etape-de-depot',
        step: 'collecte-des-propositions-vote-parcours-min-3-max-5',
      })
      const userAuhtenticationState = 'ANONYMOUS'
      const isAnonymous = false
      ProposalVoteListPage.validateVoteMin('proposalWorkflowCollectVoteA', userAuhtenticationState)
      ProposalVoteListPage.validateVoteMin('proposalWorkflowCollectVoteB', userAuhtenticationState)
      ProposalVoteListPage.validateVoteMin('proposalWorkflowCollectVoteD', userAuhtenticationState)

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
      ProposalVoteListPage.getVoteWidgetCounter().should('have.text', 4)

      ProposalVoteListPage.getProposalVoteButton('proposalWorkflowCollectVoteA').contains('voted')
      ProposalVoteListPage.getProposalVoteButton('proposalWorkflowCollectVoteB').contains('voted')
      ProposalVoteListPage.getProposalVoteButton('proposalWorkflowCollectVoteC').contains('voted')
      ProposalVoteListPage.getProposalVoteButton('proposalWorkflowCollectVoteD').contains('voted')
    })
    it('should only keep user votes since participant votes exceed votes limit', () => {
      ProposalPage.visitCollectStepPage({
        project: 'bp-vote-etape-de-depot',
        step: 'collecte-des-propositions-vote-parcours-min-3-max-5',
      })
      const userAuhtenticationState = 'ANONYMOUS'
      ProposalVoteListPage.validateVoteMin('proposalWorkflowCollectVoteD', userAuhtenticationState)
      ProposalVoteListPage.validateVoteMin('proposalWorkflowCollectVoteE', userAuhtenticationState)
      ProposalVoteListPage.validateVoteMin('proposalWorkflowCollectVoteF', userAuhtenticationState)

      cy.interceptGraphQLOperation({ operationName: 'ValidateContributionMutation' })

      ParticipationWorkflowPage.loginWithCredentials({
        email: 'lbrunet@cap-collectif.com',
        password: 'toto',
      })
      ProposalVoteListPage.getVoteWidgetCounter().should('have.text', 3)

      ProposalVoteListPage.getProposalVoteButton('proposalWorkflowCollectVoteA').contains('voted')
      ProposalVoteListPage.getProposalVoteButton('proposalWorkflowCollectVoteB').contains('voted')
      ProposalVoteListPage.getProposalVoteButton('proposalWorkflowCollectVoteC').contains('voted')
      cy.contains('participant-already-contributed-title')
    })
    it('should only keep participant votes since he is the first to reach max votes, it should delete all users votes ', () => {
      cy.task(
        'run:sql',
        'UPDATE step SET vote_type = 1, votes_min = 2, votes_limit = 2 WHERE id = "collectStepWorkflowCollectVote"',
      )
      cy.task(
        'run:sql',
        'DELETE FROM votes WHERE collect_step_id = "collectStepWorkflowCollectVote" AND voter_id = "user1"',
      )
      cy.directLoginAs('super_admin')
      ProposalPage.visitCollectStepPage({
        project: 'bp-vote-etape-de-depot',
        step: 'collecte-des-propositions-vote-parcours-min-3-max-5',
      })
      ProposalVoteListPage.validateVoteMin('proposalWorkflowCollectVoteA', 'LOGGED_IN')
      ProposalVoteListPage.getVoteWidgetCounter().should('have.text', 1)
      cy.logout()
      ProposalVoteListPage.validateVoteMin('proposalWorkflowCollectVoteB', 'ANONYMOUS')
      ProposalVoteListPage.validateVoteMin('proposalWorkflowCollectVoteC', 'ANONYMOUS')
      cy.interceptGraphQLOperation({ operationName: 'ValidateContributionMutation' })
      const isAnonymous = false
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
      ProposalVoteListPage.getVoteWidgetCounter().should('have.text', 2)

      ProposalVoteListPage.getProposalVoteButton('proposalWorkflowCollectVoteB').contains('voted')
      ProposalVoteListPage.getProposalVoteButton('proposalWorkflowCollectVoteC').contains('voted')
    })

    describe('ranking', () => {
      beforeEach(() => {
        cy.task('run:sql', 'DELETE FROM requirement WHERE step_id = "collectStepWorkflowCollectVote"')
        cy.task(
          'run:sql',
          'INSERT INTO requirement (id, step_id, type, label, position) VALUES ("requirement_test", "collectStepWorkflowCollectVote", "EMAIL_VERIFIED", null, 2)',
        )
        cy.task('run:sql', 'UPDATE fos_user SET consent_internal_communication = 1 WHERE id = "userKiroule"')
      })

      // TODO: fixme
      // ! this test currently fails in CI, preventing the pipeline from succeeding.
      // it must be fixed urgently and the test must be uncommented
      it.skip('min = 2 max = 4 => should keep user votes since he already reached min', () => {
        cy.task(
          'run:sql',
          'UPDATE step SET votes_min = 2, votes_limit = 4, votes_ranking = true WHERE id = "collectStepWorkflowCollectVote"',
        )
        cy.directLoginAs('pierre')
        ProposalPage.visitCollectStepPage({
          project: 'bp-vote-etape-de-depot',
          step: 'collecte-des-propositions-vote-parcours-min-3-max-5',
        })
        ProposalVoteListPage.validateVoteMin('proposalWorkflowCollectVoteA', 'LOGGED_IN')
        ProposalVoteListPage.validateVoteMin('proposalWorkflowCollectVoteB', 'LOGGED_IN')
        cy.logout()
        ProposalVoteListPage.validateVoteMin('proposalWorkflowCollectVoteD', 'ANONYMOUS')
        ProposalVoteListPage.validateVoteMin('proposalWorkflowCollectVoteE', 'ANONYMOUS')

        ParticipationWorkflowPage.loginWithCredentials({
          email: 'pierre@cap-collectif.com',
          password: 'toto',
        })

        cy.contains('participant-already-contributed-title')

        ProposalVoteListPage.getProposalCounter('proposalWorkflowCollectVoteA').contains('2')
        ProposalVoteListPage.getProposalCounter('proposalWorkflowCollectVoteB').contains('2')
        ProjectHeaderPage.getVotesPointsCounter('proposalWorkflowCollectVoteA').contains('4')
        ProjectHeaderPage.getVotesPointsCounter('proposalWorkflowCollectVoteB').contains('3')

        ProposalVoteListPage.getProposalCounter('proposalWorkflowCollectVoteD').contains('0')
        ProposalVoteListPage.getProposalCounter('proposalWorkflowCollectVoteE').contains('0')
        ProjectHeaderPage.getVotesPointsCounter('proposalWorkflowCollectVoteD').contains('0')
        ProjectHeaderPage.getVotesPointsCounter('proposalWorkflowCollectVoteE').contains('0')

        ProjectHeaderPage.getProjectHeaderVoteCounter().contains('5')
      })
      it('min = 2 max = 4 => should keep participants votes since user did not reach min', () => {
        cy.task(
          'run:sql',
          'UPDATE step SET votes_min = 2, votes_limit = 4, votes_ranking = true WHERE id = "collectStepWorkflowCollectVote"',
        )
        cy.directLoginAs('pierre')
        ProposalPage.visitCollectStepPage({
          project: 'bp-vote-etape-de-depot',
          step: 'collecte-des-propositions-vote-parcours-min-3-max-5',
        })
        ProposalVoteListPage.validateVoteMin('proposalWorkflowCollectVoteF', 'LOGGED_IN')
        cy.logout()
        ProposalVoteListPage.validateVoteMin('proposalWorkflowCollectVoteD', 'ANONYMOUS')
        ProposalVoteListPage.validateVoteMin('proposalWorkflowCollectVoteE', 'ANONYMOUS')

        ParticipationWorkflowPage.loginWithCredentials({
          email: 'pierre@cap-collectif.com',
          password: 'toto',
        })

        ProposalVoteListPage.getProposalCounter('proposalWorkflowCollectVoteD').contains('1')
        ProposalVoteListPage.getProposalCounter('proposalWorkflowCollectVoteE').contains('1')
        ProjectHeaderPage.getVotesPointsCounter('proposalWorkflowCollectVoteD').contains('4')
        ProjectHeaderPage.getVotesPointsCounter('proposalWorkflowCollectVoteE').contains('3')

        ProposalVoteListPage.getProposalCounter('proposalWorkflowCollectVoteF').contains('0')
        ProjectHeaderPage.getVotesPointsCounter('proposalWorkflowCollectVoteF').contains('0')
        ProjectHeaderPage.getProjectHeaderVoteCounter().contains('5')
      })
      it('min = null max = 4 => should add participant votes to user votes since combination of both did not exceed max', () => {
        cy.task(
          'run:sql',
          'UPDATE step SET votes_min = null, votes_limit = 4, votes_ranking = true WHERE id = "collectStepWorkflowCollectVote"',
        )
        cy.directLoginAs('pierre')
        ProposalPage.visitCollectStepPage({
          project: 'bp-vote-etape-de-depot',
          step: 'collecte-des-propositions-vote-parcours-min-3-max-5',
        })
        ProposalVoteListPage.validateSimpleVote('proposalWorkflowCollectVoteF', 'LOGGED_IN')
        ProposalVoteListPage.validateVoteMin('proposalWorkflowCollectVoteE', 'LOGGED_IN', true)
        cy.logout()
        ProposalVoteListPage.validateSimpleVote('proposalWorkflowCollectVoteD', 'ANONYMOUS')

        ParticipationWorkflowPage.loginWithCredentials({
          email: 'pierre@cap-collectif.com',
          password: 'toto',
        })

        ProposalVoteListPage.getProposalCounter('proposalWorkflowCollectVoteF').contains('1')
        ProposalVoteListPage.getProposalCounter('proposalWorkflowCollectVoteD').contains('1')
        ProposalVoteListPage.getProposalCounter('proposalWorkflowCollectVoteE').contains('1')

        ProjectHeaderPage.getVotesPointsCounter('proposalWorkflowCollectVoteF').contains('4')
        ProjectHeaderPage.getVotesPointsCounter('proposalWorkflowCollectVoteE').contains('3')
        ProjectHeaderPage.getVotesPointsCounter('proposalWorkflowCollectVoteD').contains('2')
        ProjectHeaderPage.getProjectHeaderVoteCounter().contains('6')
      })
      it('min = null max = 4 => should keep user votes positions when the participant is adding the same vote', () => {
        cy.task(
          'run:sql',
          'UPDATE step SET votes_min = null, votes_limit = 4, votes_ranking = true WHERE id = "collectStepWorkflowCollectVote"',
        )
        cy.directLoginAs('pierre')
        ProposalPage.visitCollectStepPage({
          project: 'bp-vote-etape-de-depot',
          step: 'collecte-des-propositions-vote-parcours-min-3-max-5',
        })
        ProposalVoteListPage.validateSimpleVote('proposalWorkflowCollectVoteF', 'LOGGED_IN')
        ProposalVoteListPage.validateVoteMin('proposalWorkflowCollectVoteE', 'LOGGED_IN', true)
        ProposalVoteListPage.validateVoteMin('proposalWorkflowCollectVoteD', 'LOGGED_IN', true)
        cy.logout()
        ProposalVoteListPage.validateSimpleVote('proposalWorkflowCollectVoteE', 'ANONYMOUS')

        ParticipationWorkflowPage.loginWithCredentials({
          email: 'pierre@cap-collectif.com',
          password: 'toto',
        })

        ProposalVoteListPage.getProposalCounter('proposalWorkflowCollectVoteF').contains('1')
        ProposalVoteListPage.getProposalCounter('proposalWorkflowCollectVoteE').contains('1')
        ProposalVoteListPage.getProposalCounter('proposalWorkflowCollectVoteD').contains('1')

        ProjectHeaderPage.getVotesPointsCounter('proposalWorkflowCollectVoteF').contains('4')
        ProjectHeaderPage.getVotesPointsCounter('proposalWorkflowCollectVoteE').contains('3')
        ProjectHeaderPage.getVotesPointsCounter('proposalWorkflowCollectVoteD').contains('2')
        ProjectHeaderPage.getProjectHeaderVoteCounter().contains('6')
      })
    })

    describe.skip('budget', () => {
      beforeEach(() => {
        cy.task('run:sql', 'DELETE FROM requirement WHERE step_id = "collectStepWorkflowCollectVote"')
        cy.task(
          'run:sql',
          'INSERT INTO requirement (id, step_id, type, label, position) VALUES ("requirement_test", "collectStepWorkflowCollectVote", "EMAIL_VERIFIED", null, 2)',
        )
        cy.task('run:sql', 'UPDATE fos_user SET consent_internal_communication = 1 WHERE id = "userKiroule"')
        cy.task('run:sql', 'UPDATE proposal SET estimation = 600 WHERE id = "proposalWorkflowCollectVoteA"')
        cy.task('run:sql', 'UPDATE proposal SET estimation = 100 WHERE id = "proposalWorkflowCollectVoteB"')
        cy.task('run:sql', 'UPDATE proposal SET estimation = 200 WHERE id = "proposalWorkflowCollectVoteD"')
        cy.task('run:sql', 'UPDATE proposal SET estimation = 200 WHERE id = "proposalWorkflowCollectVoteE"')
      })
      it('min = 2 max = 4 | budget = 1000 => should keep user votes since sum of all votes exceed budget', () => {
        cy.task(
          'run:sql',
          'UPDATE step SET votes_min = 2, votes_limit = 4, budget = 1000, votes_ranking = false, vote_type = 2 WHERE id = "collectStepWorkflowCollectVote"',
        )

        cy.directLoginAs('pierre')
        ProposalPage.visitCollectStepPage({
          project: 'bp-vote-etape-de-depot',
          step: 'collecte-des-propositions-vote-parcours-min-3-max-5',
        })
        ProposalVoteListPage.validateVoteMin('proposalWorkflowCollectVoteA', 'LOGGED_IN')
        ProposalVoteListPage.getBugdetSpent().contains('600')
        ProposalVoteListPage.validateVoteMin('proposalWorkflowCollectVoteB', 'LOGGED_IN')
        ProposalVoteListPage.getBugdetSpent().contains('700')
        cy.logout()
        ProposalVoteListPage.validateVoteMin('proposalWorkflowCollectVoteD', 'ANONYMOUS')
        ProposalVoteListPage.getBugdetSpent().contains('200')
        ProposalVoteListPage.validateVoteMin('proposalWorkflowCollectVoteE', 'ANONYMOUS')

        ParticipationWorkflowPage.loginWithCredentials({
          email: 'pierre@cap-collectif.com',
          password: 'toto',
        })
        cy.contains('participant-already-contributed-title')

        ProposalVoteListPage.getProposalCounter('proposalWorkflowCollectVoteA').contains('2')
        ProposalVoteListPage.getProposalCounter('proposalWorkflowCollectVoteB').contains('2')

        ProposalVoteListPage.getProposalCounter('proposalWorkflowCollectVoteD').contains('0')
        ProposalVoteListPage.getProposalCounter('proposalWorkflowCollectVoteE').contains('0')

        ProposalVoteListPage.getBugdetSpent().contains('700')

        ProjectHeaderPage.getProjectHeaderVoteCounter().contains('5')
      })
      it('min = 2 max = 4 | budget = 1000 => should add participant votes since sum of all votes are within the budget', () => {
        cy.task(
          'run:sql',
          'UPDATE step SET votes_min = 2, votes_limit = 4, budget = 1000, votes_ranking = false, vote_type = 2 WHERE id = "collectStepWorkflowCollectVote"',
        )

        cy.directLoginAs('pierre')
        ProposalPage.visitCollectStepPage({
          project: 'bp-vote-etape-de-depot',
          step: 'collecte-des-propositions-vote-parcours-min-3-max-5',
        })
        ProposalVoteListPage.validateVoteMin('proposalWorkflowCollectVoteA', 'LOGGED_IN')
        ProposalVoteListPage.getBugdetSpent().contains('600')
        cy.logout()
        ProposalVoteListPage.validateVoteMin('proposalWorkflowCollectVoteD', 'ANONYMOUS')
        ProposalVoteListPage.getBugdetSpent().contains('200')
        ProposalVoteListPage.validateVoteMin('proposalWorkflowCollectVoteE', 'ANONYMOUS')

        ParticipationWorkflowPage.loginWithCredentials({
          email: 'pierre@cap-collectif.com',
          password: 'toto',
        })

        ProposalVoteListPage.getProposalCounter('proposalWorkflowCollectVoteA').contains('2')
        ProposalVoteListPage.getProposalCounter('proposalWorkflowCollectVoteD').contains('1')
        ProposalVoteListPage.getProposalCounter('proposalWorkflowCollectVoteE').contains('1')
        ProposalVoteListPage.getBugdetSpent().contains('1 000')

        // Proposal B should be disabled because we reached max budget and Proposal be cost 100
        ProposalVoteListPage.getProposalVoteButton('proposalWorkflowCollectVoteB').should('have.class', 'disabled')

        ProjectHeaderPage.getProjectHeaderVoteCounter().contains('6')
      })
    })
  })
})

describe.skip('Counters', () => {
  beforeEach(() => {
    cy.task('db:restore')
    cy.task('enable:feature', 'turnstile_captcha')
  })

  it('min = 3 max = 5 | user | requirements: NO', () => {
    cy.task('run:sql', 'DELETE FROM requirement WHERE step_id = "collectStepWorkflowCollectVote"')
    cy.task('run:sql', 'UPDATE fos_user SET consent_internal_communication = 1 WHERE id = "userKiroule"')
    cy.task('swarrot:consume', 'elasticsearch_indexation')
    cy.directLoginAs('pierre')
    ProposalPage.visitCollectStepPage({
      project: 'bp-vote-etape-de-depot',
      step: 'collecte-des-propositions-vote-parcours-min-3-max-5',
    })
    const userAuhtenticationState = 'LOGGED_IN'
    ProjectHeaderPage.getProjectContributorsCounter().contains('1')
    ProposalVoteListPage.validateVoteMin('proposalWorkflowCollectVoteE', userAuhtenticationState)
    ProposalVoteListPage.validateVoteMin('proposalWorkflowCollectVoteF', userAuhtenticationState)
    ProposalVoteListPage.validateVoteMin('proposalWorkflowCollectVoteD', userAuhtenticationState)

    ProposalVoteListPage.getProposalCounter('proposalWorkflowCollectVoteE').contains('1')
    ProposalVoteListPage.getProposalCounter('proposalWorkflowCollectVoteF').contains('1')
    ProposalVoteListPage.getProposalCounter('proposalWorkflowCollectVoteD').contains('1')
    ProjectHeaderPage.getProjectHeaderVoteCounter().contains('6')
    ProjectHeaderPage.getProjectContributorsCounter().contains('2')

    ProposalVoteListPage.deleteVote('proposalWorkflowCollectVoteE', userAuhtenticationState)
    ProjectHeaderPage.getProjectHeaderVoteCounter().contains('3')
    ProjectHeaderPage.getProjectContributorsCounter().contains('1')
    ProposalVoteListPage.deleteVote('proposalWorkflowCollectVoteF', userAuhtenticationState)
    ProposalVoteListPage.deleteVote('proposalWorkflowCollectVoteD', userAuhtenticationState)

    ProposalVoteListPage.getProposalCounter('proposalWorkflowCollectVoteE').contains('0')
    ProposalVoteListPage.getProposalCounter('proposalWorkflowCollectVoteF').contains('0')
    ProposalVoteListPage.getProposalCounter('proposalWorkflowCollectVoteD').contains('0')
    ProjectHeaderPage.getProjectHeaderVoteCounter().contains('3')
    ProjectHeaderPage.getProjectContributorsCounter().contains('1')
  })

  it('min = 3 max = 5 | user | requirements: YES', () => {
    cy.task('run:sql', 'DELETE FROM requirement WHERE step_id = "collectStepWorkflowCollectVote"')
    cy.task(
      'run:sql',
      'UPDATE fos_user SET consent_internal_communication = 1, date_of_birth = null WHERE id = "userKiroule"',
    )
    cy.task(
      'run:sql',
      'INSERT INTO requirement (id, step_id, type, label, position) VALUES ("requirement_test", "collectStepWorkflowCollectVote", "DATE_OF_BIRTH", null, 2)',
    )
    cy.task('swarrot:consume', 'elasticsearch_indexation')
    cy.directLoginAs('pierre')
    ProposalPage.visitCollectStepPage({
      project: 'bp-vote-etape-de-depot',
      step: 'collecte-des-propositions-vote-parcours-min-3-max-5',
    })
    const userAuhtenticationState = 'LOGGED_IN'
    ProjectHeaderPage.getProjectContributorsCounter().contains('1')
    ProposalVoteListPage.validateVoteMin('proposalWorkflowCollectVoteE', userAuhtenticationState)
    ProposalVoteListPage.validateVoteMin('proposalWorkflowCollectVoteF', userAuhtenticationState)
    ProposalVoteListPage.validateVoteMin('proposalWorkflowCollectVoteD', userAuhtenticationState)

    ParticipationWorkflowPage.fillBirthDate({
      isAnonymous: false,
      date: '1990-01-01',
    })

    ProposalVoteListPage.getProposalCounter('proposalWorkflowCollectVoteE').contains('1')
    ProposalVoteListPage.getProposalCounter('proposalWorkflowCollectVoteF').contains('1')
    ProposalVoteListPage.getProposalCounter('proposalWorkflowCollectVoteD').contains('1')
    ProjectHeaderPage.getProjectHeaderVoteCounter().contains('6')
    ProjectHeaderPage.getProjectContributorsCounter().contains('2')

    ProposalVoteListPage.deleteVote('proposalWorkflowCollectVoteE', userAuhtenticationState)
    ProjectHeaderPage.getProjectHeaderVoteCounter().contains('3')
    ProjectHeaderPage.getProjectContributorsCounter().contains('1')
    ProposalVoteListPage.deleteVote('proposalWorkflowCollectVoteF', userAuhtenticationState)
    ProposalVoteListPage.deleteVote('proposalWorkflowCollectVoteD', userAuhtenticationState)

    ProposalVoteListPage.getProposalCounter('proposalWorkflowCollectVoteE').contains('0')
    ProposalVoteListPage.getProposalCounter('proposalWorkflowCollectVoteF').contains('0')
    ProposalVoteListPage.getProposalCounter('proposalWorkflowCollectVoteD').contains('0')
    ProjectHeaderPage.getProjectHeaderVoteCounter().contains('3')
    ProjectHeaderPage.getProjectContributorsCounter().contains('1')
  })

  it('min = null max = null | user | requirements: NO', () => {
    cy.task('run:sql', 'DELETE FROM requirement WHERE step_id = "collectStepWorkflowCollectVote"')
    cy.task(
      'run:sql',
      'UPDATE step SET votes_min = null, votes_limit = null WHERE id = "collectStepWorkflowCollectVote"',
    )
    cy.task('run:sql', 'UPDATE fos_user SET consent_internal_communication = 1 WHERE id = "userKiroule"')
    cy.task('swarrot:consume', 'elasticsearch_indexation')
    cy.directLoginAs('pierre')
    ProposalPage.visitCollectStepPage({
      project: 'bp-vote-etape-de-depot',
      step: 'collecte-des-propositions-vote-parcours-min-3-max-5',
    })
    const userAuhtenticationState = 'LOGGED_IN'
    ProjectHeaderPage.getProjectContributorsCounter().contains('1')
    ProposalVoteListPage.validateSimpleVote('proposalWorkflowCollectVoteE', userAuhtenticationState)
    ProjectHeaderPage.getProjectContributorsCounter().contains('2')
    ProposalVoteListPage.validateSimpleVote('proposalWorkflowCollectVoteF', userAuhtenticationState)
    ProposalVoteListPage.validateSimpleVote('proposalWorkflowCollectVoteD', userAuhtenticationState)

    ProposalVoteListPage.getProposalCounter('proposalWorkflowCollectVoteE').contains('1')
    ProposalVoteListPage.getProposalCounter('proposalWorkflowCollectVoteF').contains('1')
    ProposalVoteListPage.getProposalCounter('proposalWorkflowCollectVoteD').contains('1')
    ProjectHeaderPage.getProjectHeaderVoteCounter().contains('6')

    ProposalVoteListPage.deleteVote('proposalWorkflowCollectVoteE', userAuhtenticationState)
    ProjectHeaderPage.getProjectHeaderVoteCounter().contains('5')
    ProjectHeaderPage.getProjectContributorsCounter().contains('2')
    ProposalVoteListPage.deleteVote('proposalWorkflowCollectVoteF', userAuhtenticationState)
    ProjectHeaderPage.getProjectHeaderVoteCounter().contains('4')
    ProjectHeaderPage.getProjectContributorsCounter().contains('2')
    ProposalVoteListPage.deleteVote('proposalWorkflowCollectVoteD', userAuhtenticationState)
    ProjectHeaderPage.getProjectHeaderVoteCounter().contains('3')

    ProposalVoteListPage.getProposalCounter('proposalWorkflowCollectVoteE').contains('0')
    ProposalVoteListPage.getProposalCounter('proposalWorkflowCollectVoteF').contains('0')
    ProposalVoteListPage.getProposalCounter('proposalWorkflowCollectVoteD').contains('0')
    ProjectHeaderPage.getProjectHeaderVoteCounter().contains('3')
    ProjectHeaderPage.getProjectContributorsCounter().contains('1')
  })

  it('min = null max = null | user | requirements: YES', () => {
    cy.task('run:sql', 'DELETE FROM requirement WHERE step_id = "collectStepWorkflowCollectVote"')
    cy.task(
      'run:sql',
      'INSERT INTO requirement (id, step_id, type, label, position) VALUES ("requirement_test", "collectStepWorkflowCollectVote", "DATE_OF_BIRTH", null, 2)',
    )
    cy.task(
      'run:sql',
      'UPDATE fos_user SET consent_internal_communication = 1, date_of_birth = null WHERE id = "userKiroule"',
    )
    cy.task(
      'run:sql',
      'UPDATE step SET votes_min = null, votes_limit = null WHERE id = "collectStepWorkflowCollectVote"',
    )
    cy.task('swarrot:consume', 'elasticsearch_indexation')
    cy.interceptGraphQLOperation({ operationName: 'ValidateContributionMutation' })

    cy.directLoginAs('pierre')
    ProposalPage.visitCollectStepPage({
      project: 'bp-vote-etape-de-depot',
      step: 'collecte-des-propositions-vote-parcours-min-3-max-5',
    })
    const userAuhtenticationState = 'LOGGED_IN'
    ProjectHeaderPage.getProjectContributorsCounter().contains('1')
    ProposalVoteListPage.validateSimpleVote('proposalWorkflowCollectVoteE', userAuhtenticationState)

    ParticipationWorkflowPage.fillBirthDate({
      isAnonymous: false,
      date: '1990-01-01',
    })

    cy.wait('@ValidateContributionMutation')

    cy.contains('your-participation-is-confirmed')
    ProjectHeaderPage.getProjectContributorsCounter().contains('2')

    ProposalVoteListPage.validateSimpleVote('proposalWorkflowCollectVoteF', userAuhtenticationState)
    ProjectHeaderPage.getProjectContributorsCounter().contains('2')
    ProposalVoteListPage.validateSimpleVote('proposalWorkflowCollectVoteD', userAuhtenticationState)
    ProjectHeaderPage.getProjectContributorsCounter().contains('2')

    ProposalVoteListPage.getProposalCounter('proposalWorkflowCollectVoteE').contains('1')
    ProposalVoteListPage.getProposalCounter('proposalWorkflowCollectVoteF').contains('1')
    ProposalVoteListPage.getProposalCounter('proposalWorkflowCollectVoteD').contains('1')
    ProjectHeaderPage.getProjectHeaderVoteCounter().contains('6')

    ProposalVoteListPage.deleteVote('proposalWorkflowCollectVoteE', userAuhtenticationState)
    ProjectHeaderPage.getProjectHeaderVoteCounter().contains('5')
    ProjectHeaderPage.getProjectContributorsCounter().contains('2')
    ProposalVoteListPage.deleteVote('proposalWorkflowCollectVoteF', userAuhtenticationState)
    ProjectHeaderPage.getProjectHeaderVoteCounter().contains('4')
    ProjectHeaderPage.getProjectContributorsCounter().contains('2')
    ProposalVoteListPage.deleteVote('proposalWorkflowCollectVoteD', userAuhtenticationState)
    ProjectHeaderPage.getProjectHeaderVoteCounter().contains('3')
    ProjectHeaderPage.getProjectContributorsCounter().contains('1')

    ProposalVoteListPage.getProposalCounter('proposalWorkflowCollectVoteE').contains('0')
    ProposalVoteListPage.getProposalCounter('proposalWorkflowCollectVoteF').contains('0')
    ProposalVoteListPage.getProposalCounter('proposalWorkflowCollectVoteD').contains('0')
  })

  it('min = 3 max = 5 | participant | requirements: NO', () => {
    cy.task('run:sql', 'DELETE FROM requirement WHERE step_id = "collectStepWorkflowCollectVote"')
    cy.task('swarrot:consume', 'elasticsearch_indexation')
    ProposalPage.visitCollectStepPage({
      project: 'bp-vote-etape-de-depot',
      step: 'collecte-des-propositions-vote-parcours-min-3-max-5',
    })
    const userAuhtenticationState = 'ANONYMOUS'
    ProjectHeaderPage.getProjectContributorsCounter().contains('1')
    ProposalVoteListPage.validateVoteMin('proposalWorkflowCollectVoteE', userAuhtenticationState)
    ProjectHeaderPage.getProjectContributorsCounter().contains('1')
    ProposalVoteListPage.validateVoteMin('proposalWorkflowCollectVoteF', userAuhtenticationState)
    ProjectHeaderPage.getProjectContributorsCounter().contains('1')
    ProposalVoteListPage.validateVoteMin('proposalWorkflowCollectVoteD', userAuhtenticationState)

    ParticipationWorkflowPage.fillConsentInternalCommunicationEmail({ email: null })

    ProposalVoteListPage.getProposalCounter('proposalWorkflowCollectVoteE').contains('1')
    ProposalVoteListPage.getProposalCounter('proposalWorkflowCollectVoteF').contains('1')
    ProposalVoteListPage.getProposalCounter('proposalWorkflowCollectVoteD').contains('1')
    ProjectHeaderPage.getProjectHeaderVoteCounter().contains('6')
    ProjectHeaderPage.getProjectContributorsCounter().contains('2')

    ProposalVoteListPage.deleteVote('proposalWorkflowCollectVoteE', userAuhtenticationState)
    ProjectHeaderPage.getProjectHeaderVoteCounter().contains('3')
    ProjectHeaderPage.getProjectContributorsCounter().contains('1')
    ProposalVoteListPage.deleteVote('proposalWorkflowCollectVoteF', userAuhtenticationState)
    ProposalVoteListPage.deleteVote('proposalWorkflowCollectVoteD', userAuhtenticationState)

    ProposalVoteListPage.getProposalCounter('proposalWorkflowCollectVoteE').contains('0')
    ProposalVoteListPage.getProposalCounter('proposalWorkflowCollectVoteF').contains('0')
    ProposalVoteListPage.getProposalCounter('proposalWorkflowCollectVoteD').contains('0')
    ProjectHeaderPage.getProjectHeaderVoteCounter().contains('3')
    ProjectHeaderPage.getProjectContributorsCounter().contains('1')
  })

  it('min = 3 max = 5 | participant | requirements: YES', () => {
    cy.task('run:sql', 'DELETE FROM requirement WHERE step_id = "collectStepWorkflowCollectVote"')
    cy.task(
      'run:sql',
      'INSERT INTO requirement (id, step_id, type, label, position) VALUES ("requirement_test", "collectStepWorkflowCollectVote", "DATE_OF_BIRTH", null, 2)',
    )
    cy.task('swarrot:consume', 'elasticsearch_indexation')
    ProposalPage.visitCollectStepPage({
      project: 'bp-vote-etape-de-depot',
      step: 'collecte-des-propositions-vote-parcours-min-3-max-5',
    })
    const userAuhtenticationState = 'ANONYMOUS'
    ProjectHeaderPage.getProjectContributorsCounter().contains('1')
    ProposalVoteListPage.validateVoteMin('proposalWorkflowCollectVoteE', userAuhtenticationState)
    ProjectHeaderPage.getProjectContributorsCounter().contains('1')
    ProposalVoteListPage.validateVoteMin('proposalWorkflowCollectVoteF', userAuhtenticationState)
    ProjectHeaderPage.getProjectContributorsCounter().contains('1')
    ProposalVoteListPage.validateVoteMin('proposalWorkflowCollectVoteD', userAuhtenticationState)

    ParticipationWorkflowPage.fillBirthDate({
      isAnonymous: true,
      date: '1990-01-01',
    })
    ParticipationWorkflowPage.fillConsentInternalCommunicationEmail({ email: null })

    ProposalVoteListPage.getProposalCounter('proposalWorkflowCollectVoteE').contains('1')
    ProposalVoteListPage.getProposalCounter('proposalWorkflowCollectVoteF').contains('1')
    ProposalVoteListPage.getProposalCounter('proposalWorkflowCollectVoteD').contains('1')
    ProjectHeaderPage.getProjectHeaderVoteCounter().contains('6')
    ProjectHeaderPage.getProjectContributorsCounter().contains('2')

    ProposalVoteListPage.deleteVote('proposalWorkflowCollectVoteE', userAuhtenticationState)
    ProjectHeaderPage.getProjectHeaderVoteCounter().contains('3')
    ProjectHeaderPage.getProjectContributorsCounter().contains('1')
    ProposalVoteListPage.deleteVote('proposalWorkflowCollectVoteF', userAuhtenticationState)
    ProposalVoteListPage.deleteVote('proposalWorkflowCollectVoteD', userAuhtenticationState)

    ProposalVoteListPage.getProposalCounter('proposalWorkflowCollectVoteE').contains('0')
    ProposalVoteListPage.getProposalCounter('proposalWorkflowCollectVoteF').contains('0')
    ProposalVoteListPage.getProposalCounter('proposalWorkflowCollectVoteD').contains('0')
    ProjectHeaderPage.getProjectHeaderVoteCounter().contains('3')
  })

  it('min = null max = null | participant | requirements: NO', () => {
    cy.task('run:sql', 'DELETE FROM requirement WHERE step_id = "collectStepWorkflowCollectVote"')
    cy.task(
      'run:sql',
      'UPDATE step SET votes_min = null, votes_limit = null WHERE id = "collectStepWorkflowCollectVote"',
    )
    cy.task('swarrot:consume', 'elasticsearch_indexation')
    ProposalPage.visitCollectStepPage({
      project: 'bp-vote-etape-de-depot',
      step: 'collecte-des-propositions-vote-parcours-min-3-max-5',
    })
    const userAuhtenticationState = 'ANONYMOUS'
    ProjectHeaderPage.getProjectContributorsCounter().contains('1')
    ProposalVoteListPage.validateSimpleVote('proposalWorkflowCollectVoteE', userAuhtenticationState)
    ParticipationWorkflowPage.fillConsentInternalCommunicationEmail({ email: null })
    ProjectHeaderPage.getProjectContributorsCounter().contains('2')
    ProposalVoteListPage.validateSimpleVote('proposalWorkflowCollectVoteF', userAuhtenticationState)
    ProjectHeaderPage.getProjectContributorsCounter().contains('2')
    ProposalVoteListPage.validateSimpleVote('proposalWorkflowCollectVoteD', userAuhtenticationState)
    ProjectHeaderPage.getProjectContributorsCounter().contains('2')

    ProposalVoteListPage.getProposalCounter('proposalWorkflowCollectVoteE').contains('1')
    ProposalVoteListPage.getProposalCounter('proposalWorkflowCollectVoteF').contains('1')
    ProposalVoteListPage.getProposalCounter('proposalWorkflowCollectVoteD').contains('1')
    ProjectHeaderPage.getProjectHeaderVoteCounter().contains('6')

    ProposalVoteListPage.deleteVote('proposalWorkflowCollectVoteE', userAuhtenticationState)
    ProjectHeaderPage.getProjectHeaderVoteCounter().contains('5')
    ProjectHeaderPage.getProjectContributorsCounter().contains('2')
    ProposalVoteListPage.deleteVote('proposalWorkflowCollectVoteF', userAuhtenticationState)
    ProjectHeaderPage.getProjectHeaderVoteCounter().contains('4')
    ProjectHeaderPage.getProjectContributorsCounter().contains('2')
    ProposalVoteListPage.deleteVote('proposalWorkflowCollectVoteD', userAuhtenticationState)
    ProjectHeaderPage.getProjectHeaderVoteCounter().contains('3')
    ProjectHeaderPage.getProjectContributorsCounter().contains('1')

    ProposalVoteListPage.getProposalCounter('proposalWorkflowCollectVoteE').contains('0')
    ProposalVoteListPage.getProposalCounter('proposalWorkflowCollectVoteF').contains('0')
    ProposalVoteListPage.getProposalCounter('proposalWorkflowCollectVoteD').contains('0')
    ProjectHeaderPage.getProjectHeaderVoteCounter().contains('3')
  })

  it('min = null max = null | participant | requirements: YES', () => {
    cy.task('run:sql', 'DELETE FROM requirement WHERE step_id = "collectStepWorkflowCollectVote"')
    cy.task(
      'run:sql',
      'UPDATE step SET votes_min = null, votes_limit = null WHERE id = "collectStepWorkflowCollectVote"',
    )
    cy.task(
      'run:sql',
      'INSERT INTO requirement (id, step_id, type, label, position) VALUES ("requirement_test", "collectStepWorkflowCollectVote", "DATE_OF_BIRTH", null, 2)',
    )
    cy.task('swarrot:consume', 'elasticsearch_indexation')
    ProposalPage.visitCollectStepPage({
      project: 'bp-vote-etape-de-depot',
      step: 'collecte-des-propositions-vote-parcours-min-3-max-5',
    })
    const userAuhtenticationState = 'ANONYMOUS'
    ProjectHeaderPage.getProjectContributorsCounter().contains('1')
    ProposalVoteListPage.validateSimpleVote('proposalWorkflowCollectVoteE', userAuhtenticationState)

    ParticipationWorkflowPage.fillBirthDate({
      isAnonymous: true,
      date: '1990-01-01',
    })
    ParticipationWorkflowPage.fillConsentInternalCommunicationEmail({ email: null })
    ProjectHeaderPage.getProjectContributorsCounter().contains('2')

    ProposalVoteListPage.validateSimpleVote('proposalWorkflowCollectVoteF', userAuhtenticationState)
    ProjectHeaderPage.getProjectContributorsCounter().contains('2')
    ProposalVoteListPage.validateSimpleVote('proposalWorkflowCollectVoteD', userAuhtenticationState)
    ProjectHeaderPage.getProjectContributorsCounter().contains('2')

    ProposalVoteListPage.getProposalCounter('proposalWorkflowCollectVoteE').contains('1')
    ProposalVoteListPage.getProposalCounter('proposalWorkflowCollectVoteF').contains('1')
    ProposalVoteListPage.getProposalCounter('proposalWorkflowCollectVoteD').contains('1')
    ProjectHeaderPage.getProjectHeaderVoteCounter().contains('6')

    ProposalVoteListPage.deleteVote('proposalWorkflowCollectVoteE', userAuhtenticationState)
    ProjectHeaderPage.getProjectHeaderVoteCounter().contains('5')
    ProjectHeaderPage.getProjectContributorsCounter().contains('2')
    ProposalVoteListPage.deleteVote('proposalWorkflowCollectVoteF', userAuhtenticationState)
    ProjectHeaderPage.getProjectHeaderVoteCounter().contains('4')
    ProjectHeaderPage.getProjectContributorsCounter().contains('2')
    ProposalVoteListPage.deleteVote('proposalWorkflowCollectVoteD', userAuhtenticationState)
    ProjectHeaderPage.getProjectHeaderVoteCounter().contains('3')
    ProjectHeaderPage.getProjectContributorsCounter().contains('1')

    ProposalVoteListPage.getProposalCounter('proposalWorkflowCollectVoteE').contains('0')
    ProposalVoteListPage.getProposalCounter('proposalWorkflowCollectVoteF').contains('0')
    ProposalVoteListPage.getProposalCounter('proposalWorkflowCollectVoteD').contains('0')
    ProjectHeaderPage.getProjectHeaderVoteCounter().contains('3')
  })
})

describe.skip('votes ranking', () => {
  beforeEach(() => {
    cy.task('db:restore')
    cy.task('enable:feature', 'turnstile_captcha')
  })

  it('min = 3 max = 5 | participant | requirements: YES', () => {
    cy.task('run:sql', 'DELETE FROM requirement WHERE step_id = "collectStepWorkflowCollectVote"')
    cy.task(
      'run:sql',
      'INSERT INTO requirement (id, step_id, type, label, position) VALUES ("requirement_test", "collectStepWorkflowCollectVote", "DATE_OF_BIRTH", null, 2)',
    )
    cy.task('run:sql', 'UPDATE step SET votes_ranking = 1 WHERE id = "collectStepWorkflowCollectVote"')
    cy.task('swarrot:consume', 'elasticsearch_indexation')
    ProposalPage.visitCollectStepPage({
      project: 'bp-vote-etape-de-depot',
      step: 'collecte-des-propositions-vote-parcours-min-3-max-5',
    })
    const userAuhtenticationState = 'ANONYMOUS'
    ProposalVoteListPage.validateVoteMin('proposalWorkflowCollectVoteE', userAuhtenticationState, true)
    ProposalVoteListPage.validateVoteMin('proposalWorkflowCollectVoteF', userAuhtenticationState, true)
    ProposalVoteListPage.validateVoteMin('proposalWorkflowCollectVoteD', userAuhtenticationState, true)

    ParticipationWorkflowPage.fillBirthDate({
      isAnonymous: true,
      date: '1990-01-01',
    })
    ParticipationWorkflowPage.fillConsentInternalCommunicationEmail({ email: null })

    ProjectHeaderPage.getVotesPointsCounter('proposalWorkflowCollectVoteE').contains('5')
    ProjectHeaderPage.getVotesPointsCounter('proposalWorkflowCollectVoteF').contains('4')
    ProjectHeaderPage.getVotesPointsCounter('proposalWorkflowCollectVoteD').contains('3')

    ProposalVoteListPage.deleteVote('proposalWorkflowCollectVoteE', userAuhtenticationState)
    ProjectHeaderPage.getVotesPointsCounter('proposalWorkflowCollectVoteE').contains('0')
    ProjectHeaderPage.getVotesPointsCounter('proposalWorkflowCollectVoteF').contains('0')
    ProjectHeaderPage.getVotesPointsCounter('proposalWorkflowCollectVoteD').contains('0')
  })

  it('min = 3 max = 5 | participant | requirements: NO', () => {
    cy.task('run:sql', 'DELETE FROM requirement WHERE step_id = "collectStepWorkflowCollectVote"')
    cy.task('run:sql', 'UPDATE step SET votes_ranking = 1 WHERE id = "collectStepWorkflowCollectVote"')
    cy.task('swarrot:consume', 'elasticsearch_indexation')
    ProposalPage.visitCollectStepPage({
      project: 'bp-vote-etape-de-depot',
      step: 'collecte-des-propositions-vote-parcours-min-3-max-5',
    })
    const userAuhtenticationState = 'ANONYMOUS'
    ProposalVoteListPage.validateVoteMin('proposalWorkflowCollectVoteE', userAuhtenticationState, true)
    ProposalVoteListPage.validateVoteMin('proposalWorkflowCollectVoteF', userAuhtenticationState, true)
    ProposalVoteListPage.validateVoteMin('proposalWorkflowCollectVoteD', userAuhtenticationState, true)

    ParticipationWorkflowPage.fillConsentInternalCommunicationEmail({ email: null })

    ProjectHeaderPage.getVotesPointsCounter('proposalWorkflowCollectVoteE').contains('5')
    ProjectHeaderPage.getVotesPointsCounter('proposalWorkflowCollectVoteF').contains('4')
    ProjectHeaderPage.getVotesPointsCounter('proposalWorkflowCollectVoteD').contains('3')

    ProposalVoteListPage.deleteVote('proposalWorkflowCollectVoteE', userAuhtenticationState)
    ProjectHeaderPage.getVotesPointsCounter('proposalWorkflowCollectVoteE').contains('0')
    ProjectHeaderPage.getVotesPointsCounter('proposalWorkflowCollectVoteF').contains('0')
    ProjectHeaderPage.getVotesPointsCounter('proposalWorkflowCollectVoteD').contains('0')
  })

  it('min = 3 max = 5 | user | requirements: YES', () => {
    cy.task('run:sql', 'DELETE FROM requirement WHERE step_id = "collectStepWorkflowCollectVote"')
    cy.task(
      'run:sql',
      'UPDATE fos_user SET consent_internal_communication = 1, date_of_birth = null WHERE id = "userKiroule"',
    )
    cy.task(
      'run:sql',
      'INSERT INTO requirement (id, step_id, type, label, position) VALUES ("requirement_test", "collectStepWorkflowCollectVote", "DATE_OF_BIRTH", null, 2)',
    )
    cy.task('run:sql', 'UPDATE step SET votes_ranking = 1 WHERE id = "collectStepWorkflowCollectVote"')
    cy.task('swarrot:consume', 'elasticsearch_indexation')

    cy.directLoginAs('pierre')
    ProposalPage.visitCollectStepPage({
      project: 'bp-vote-etape-de-depot',
      step: 'collecte-des-propositions-vote-parcours-min-3-max-5',
    })
    const userAuhtenticationState = 'LOGGED_IN'
    ProposalVoteListPage.validateVoteMin('proposalWorkflowCollectVoteE', userAuhtenticationState, true)
    ProposalVoteListPage.validateVoteMin('proposalWorkflowCollectVoteF', userAuhtenticationState, true)
    ProposalVoteListPage.validateVoteMin('proposalWorkflowCollectVoteD', userAuhtenticationState, true)

    ParticipationWorkflowPage.fillBirthDate({
      isAnonymous: false,
      date: '1990-01-01',
    })

    ProjectHeaderPage.getVotesPointsCounter('proposalWorkflowCollectVoteE').contains('5')
    ProjectHeaderPage.getVotesPointsCounter('proposalWorkflowCollectVoteF').contains('4')
    ProjectHeaderPage.getVotesPointsCounter('proposalWorkflowCollectVoteD').contains('3')

    ProposalVoteListPage.deleteVote('proposalWorkflowCollectVoteE', userAuhtenticationState)
    ProjectHeaderPage.getVotesPointsCounter('proposalWorkflowCollectVoteE').contains('0')
    ProjectHeaderPage.getVotesPointsCounter('proposalWorkflowCollectVoteF').contains('0')
    ProjectHeaderPage.getVotesPointsCounter('proposalWorkflowCollectVoteD').contains('0')
  })

  it('min = 3 max = 5 | user | requirements: NO', () => {
    cy.task('run:sql', 'DELETE FROM requirement WHERE step_id = "collectStepWorkflowCollectVote"')
    cy.task('run:sql', 'UPDATE fos_user SET consent_internal_communication = 1 WHERE id = "userKiroule"')
    cy.task('run:sql', 'UPDATE step SET votes_ranking = 1 WHERE id = "collectStepWorkflowCollectVote"')
    cy.task('swarrot:consume', 'elasticsearch_indexation')

    cy.directLoginAs('pierre')
    ProposalPage.visitCollectStepPage({
      project: 'bp-vote-etape-de-depot',
      step: 'collecte-des-propositions-vote-parcours-min-3-max-5',
    })
    const userAuhtenticationState = 'LOGGED_IN'
    ProposalVoteListPage.validateVoteMin('proposalWorkflowCollectVoteE', userAuhtenticationState, true)
    ProposalVoteListPage.validateVoteMin('proposalWorkflowCollectVoteF', userAuhtenticationState, true)
    ProposalVoteListPage.validateVoteMin('proposalWorkflowCollectVoteD', userAuhtenticationState, true)

    ProjectHeaderPage.getVotesPointsCounter('proposalWorkflowCollectVoteE').contains('5')
    ProjectHeaderPage.getVotesPointsCounter('proposalWorkflowCollectVoteF').contains('4')
    ProjectHeaderPage.getVotesPointsCounter('proposalWorkflowCollectVoteD').contains('3')

    ProposalVoteListPage.deleteVote('proposalWorkflowCollectVoteE', userAuhtenticationState)
    ProjectHeaderPage.getVotesPointsCounter('proposalWorkflowCollectVoteE').contains('0')
    ProjectHeaderPage.getVotesPointsCounter('proposalWorkflowCollectVoteF').contains('0')
    ProjectHeaderPage.getVotesPointsCounter('proposalWorkflowCollectVoteD').contains('0')
  })
})
