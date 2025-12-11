import { ParticipationWorkflowPage, ProjectHeaderPage, ProposalPage, ProposalVoteListPage } from '~e2e/pages'

describe('Proposal Selection Vote Page workflow', () => {
  beforeEach(() => {
    cy.task('db:restore')
    cy.task('enable:feature', 'turnstile_captcha')
  })

  describe('should trigger workflow after reaching min votes and validate vote through workflow', () => {
    it('as participant', () => {
      ProposalPage.visitSelectionStepPage({
        project: 'bp-vote-parcours',
        step: 'vote-parcours-min-3-max-5',
      })
      const userAuhtenticationState = 'ANONYMOUS'
      const isAnonymous = true
      ProposalVoteListPage.validateVoteMin('proposalWorkflowVoteA', userAuhtenticationState)
      ProposalVoteListPage.validateVoteMin('proposalWorkflowVoteB', userAuhtenticationState)
      ProposalVoteListPage.validateVoteMin('proposalWorkflowVoteC', userAuhtenticationState)

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

      ProposalVoteListPage.getVoteWidgetCounter().should('have.text', 3)
      ProposalVoteListPage.getProposalVoteButton('proposalWorkflowVoteA').contains('voted')
      ProposalVoteListPage.getProposalVoteButton('proposalWorkflowVoteB').contains('voted')
      ProposalVoteListPage.getProposalVoteButton('proposalWorkflowVoteC').contains('voted')
    })

    it('as logged in user ', () => {
      cy.directLoginAs('pierre')
      ProposalPage.visitSelectionStepPage({
        project: 'bp-vote-parcours',
        step: 'vote-parcours-min-3-max-5',
      })
      const userAuhtenticationState = 'LOGGED_IN'
      const isAnonymous = false
      ProposalVoteListPage.validateVoteMin('proposalWorkflowVoteA', userAuhtenticationState)
      ProposalVoteListPage.validateVoteMin('proposalWorkflowVoteB', userAuhtenticationState)
      ProposalVoteListPage.validateVoteMin('proposalWorkflowVoteC', userAuhtenticationState)

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

      ProposalVoteListPage.getVoteWidgetCounter().should('have.text', 3)

      ProposalVoteListPage.getProposalVoteButton('proposalWorkflowVoteA').contains('voted')
      ProposalVoteListPage.getProposalVoteButton('proposalWorkflowVoteB').contains('voted')
      ProposalVoteListPage.getProposalVoteButton('proposalWorkflowVoteC').contains('voted')
    })

    it('as logged in user through the workflow using login/password', () => {
      ProposalPage.visitSelectionStepPage({
        project: 'bp-vote-parcours',
        step: 'vote-parcours-min-3-max-5',
      })
      const userAuhtenticationState = 'ANONYMOUS'
      const isAnonymous = false
      ProposalVoteListPage.validateVoteMin('proposalWorkflowVoteA', userAuhtenticationState)
      ProposalVoteListPage.validateVoteMin('proposalWorkflowVoteB', userAuhtenticationState)
      ProposalVoteListPage.validateVoteMin('proposalWorkflowVoteC', userAuhtenticationState)

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

      ProposalVoteListPage.getVoteWidgetCounter().should('have.text', 3)

      ProposalVoteListPage.getProposalVoteButton('proposalWorkflowVoteA').contains('voted')
      ProposalVoteListPage.getProposalVoteButton('proposalWorkflowVoteB').contains('voted')
      ProposalVoteListPage.getProposalVoteButton('proposalWorkflowVoteC').contains('voted')
    })

    it('as logged in user through the magic link', () => {
      ProposalPage.visitSelectionStepPage({
        project: 'bp-vote-parcours',
        step: 'vote-parcours-min-3-max-5',
      })
      const userAuhtenticationState = 'ANONYMOUS'
      const isAnonymous = false
      ProposalVoteListPage.validateVoteMin('proposalWorkflowVoteA', userAuhtenticationState)
      ProposalVoteListPage.validateVoteMin('proposalWorkflowVoteB', userAuhtenticationState)
      ProposalVoteListPage.validateVoteMin('proposalWorkflowVoteC', userAuhtenticationState)

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

      ProposalVoteListPage.getVoteWidgetCounter().should('have.text', 3)

      ProposalVoteListPage.getProposalVoteButton('proposalWorkflowVoteA').contains('voted')
      ProposalVoteListPage.getProposalVoteButton('proposalWorkflowVoteB').contains('voted')
      ProposalVoteListPage.getProposalVoteButton('proposalWorkflowVoteC').contains('voted')
    })
  })

  describe('internal communication', () => {
    it('should trigger consentInternalCommunication email form when the step has requirements: NO', () => {
      cy.task('run:sql', 'DELETE FROM requirement WHERE step_id = "selectionStepWorkflowVote1"')

      ProposalPage.visitSelectionStepPage({
        project: 'bp-vote-parcours',
        step: 'vote-parcours-min-3-max-5',
      })
      const userAuhtenticationState = 'ANONYMOUS'
      ProposalVoteListPage.validateVoteMin('proposalWorkflowVoteA', userAuhtenticationState)
      ProposalVoteListPage.validateVoteMin('proposalWorkflowVoteB', userAuhtenticationState)
      ProposalVoteListPage.validateVoteMin('proposalWorkflowVoteC', userAuhtenticationState)

      ParticipationWorkflowPage.fillConsentInternalCommunicationEmail({ email: 'johndoe@gmail.com' })
    })
  })

  describe('reconciliating votes', () => {
    it('min = 3 | max = 4 => should merge participant votes with logged in user votes', () => {
      ProposalPage.visitSelectionStepPage({
        project: 'bp-vote-parcours',
        step: 'vote-parcours-min-3-max-5',
      })
      const userAuhtenticationState = 'ANONYMOUS'
      const isAnonymous = false
      ProposalVoteListPage.validateVoteMin('proposalWorkflowVoteA', userAuhtenticationState)
      ProposalVoteListPage.validateVoteMin('proposalWorkflowVoteB', userAuhtenticationState)
      ProposalVoteListPage.validateVoteMin('proposalWorkflowVoteD', userAuhtenticationState)

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

      ProposalVoteListPage.getProposalVoteButton('proposalWorkflowVoteA').contains('voted')
      ProposalVoteListPage.getProposalVoteButton('proposalWorkflowVoteB').contains('voted')
      ProposalVoteListPage.getProposalVoteButton('proposalWorkflowVoteC').contains('voted')
      ProposalVoteListPage.getProposalVoteButton('proposalWorkflowVoteD').contains('voted')
    })
    it('should only keep user votes since participant votes exceed votes limit', () => {
      ProposalPage.visitSelectionStepPage({
        project: 'bp-vote-parcours',
        step: 'vote-parcours-min-3-max-5',
      })
      const userAuhtenticationState = 'ANONYMOUS'
      ProposalVoteListPage.validateVoteMin('proposalWorkflowVoteD', userAuhtenticationState)
      ProposalVoteListPage.validateVoteMin('proposalWorkflowVoteE', userAuhtenticationState)
      ProposalVoteListPage.validateVoteMin('proposalWorkflowVoteF', userAuhtenticationState)

      cy.interceptGraphQLOperation({ operationName: 'ValidateContributionMutation' })

      ParticipationWorkflowPage.loginWithCredentials({
        email: 'lbrunet@cap-collectif.com',
        password: 'toto',
      })
      ProposalVoteListPage.getVoteWidgetCounter().should('have.text', 3)

      ProposalVoteListPage.getProposalVoteButton('proposalWorkflowVoteA').contains('voted')
      ProposalVoteListPage.getProposalVoteButton('proposalWorkflowVoteB').contains('voted')
      ProposalVoteListPage.getProposalVoteButton('proposalWorkflowVoteC').contains('voted')
      cy.contains('participant-already-contributed-title')
    })
    it('should only keep participant votes since he is the first to reach max votes, it should delete all users votes ', () => {
      cy.directLoginAs('super_admin')
      ProposalPage.visitSelectionStepPage({
        project: 'bp-vote-parcours-min-2-max-2',
        step: 'vote-parcours-min-2-max-2',
      })
      ProposalVoteListPage.validateVoteMin('proposalWorkflowVote2-A', 'LOGGED_IN')
      ProposalVoteListPage.getVoteWidgetCounter().should('have.text', 1)
      cy.logout()
      ProposalVoteListPage.validateVoteMin('proposalWorkflowVote2-B', 'ANONYMOUS')
      ProposalVoteListPage.validateVoteMin('proposalWorkflowVote2-C', 'ANONYMOUS')
      cy.interceptGraphQLOperation({ operationName: 'ValidateContributionMutation' })
      ParticipationWorkflowPage.loginWithCredentials({
        email: 'lbrunet@cap-collectif.com',
        password: 'toto',
      })
      ParticipationWorkflowPage.consentPrivacyPolicy(false)
      ParticipationWorkflowPage.fillZipCode({
        isAnonymous: false,
        zipCode: '75100',
      })
      ProposalVoteListPage.getVoteWidgetCounter().should('have.text', 2)

      ProposalVoteListPage.getProposalVoteButton('proposalWorkflowVote2-B').contains('voted')
      ProposalVoteListPage.getProposalVoteButton('proposalWorkflowVote2-C').contains('voted')
    })

    describe('ranking', () => {
      beforeEach(() => {
        cy.task('run:sql', 'DELETE FROM requirement WHERE step_id = "selectionStepWorkflowVote1"')
        cy.task(
          'run:sql',
          'INSERT INTO requirement (id, step_id, type, label, position) VALUES ("requirement32", "selectionStepWorkflowVote1", "EMAIL_VERIFIED", null, 2)',
        )
        cy.task('run:sql', 'UPDATE fos_user SET consent_internal_communication = 1 WHERE id = "userKiroule"')
      })
      it('min = 2 max = 4 => should keep user votes since he already reached min', () => {
        cy.task(
          'run:sql',
          'UPDATE step SET votes_min = 2, votes_limit = 4, votes_ranking = true WHERE id = "selectionStepWorkflowVote1"',
        )
        cy.directLoginAs('pierre')
        ProposalPage.visitSelectionStepPage({
          project: 'bp-vote-parcours',
          step: 'vote-parcours-min-3-max-5',
        })
        ProposalVoteListPage.validateVoteMin('proposalWorkflowVoteA', 'LOGGED_IN')
        ProposalVoteListPage.validateVoteMin('proposalWorkflowVoteB', 'LOGGED_IN')
        cy.logout()
        ProposalVoteListPage.validateVoteMin('proposalWorkflowVoteD', 'ANONYMOUS')
        ProposalVoteListPage.validateVoteMin('proposalWorkflowVoteE', 'ANONYMOUS')

        ParticipationWorkflowPage.loginWithCredentials({
          email: 'pierre@cap-collectif.com',
          password: 'toto',
        })
        cy.contains('participant-already-contributed-title')

        ProposalVoteListPage.getProposalCounter('proposalWorkflowVoteA').contains('2')
        ProposalVoteListPage.getProposalCounter('proposalWorkflowVoteB').contains('2')
        ProjectHeaderPage.getVotesPointsCounter('proposalWorkflowVoteA').contains('4')
        ProjectHeaderPage.getVotesPointsCounter('proposalWorkflowVoteB').contains('3')

        ProposalVoteListPage.getProposalCounter('proposalWorkflowVoteD').contains('0')
        ProposalVoteListPage.getProposalCounter('proposalWorkflowVoteE').contains('0')
        ProjectHeaderPage.getVotesPointsCounter('proposalWorkflowVoteD').contains('0')
        ProjectHeaderPage.getVotesPointsCounter('proposalWorkflowVoteE').contains('0')

        ProjectHeaderPage.getProjectHeaderVoteCounter().contains('5')
      })
      it('min = 2 max = 4 => should keep participants votes since user did not reach min', () => {
        cy.task(
          'run:sql',
          'UPDATE step SET votes_min = 2, votes_limit = 4, votes_ranking = true WHERE id = "selectionStepWorkflowVote1"',
        )
        cy.directLoginAs('pierre')
        ProposalPage.visitSelectionStepPage({
          project: 'bp-vote-parcours',
          step: 'vote-parcours-min-3-max-5',
        })
        ProposalVoteListPage.validateVoteMin('proposalWorkflowVoteF', 'LOGGED_IN')
        cy.logout()
        ProposalVoteListPage.validateVoteMin('proposalWorkflowVoteD', 'ANONYMOUS')
        ProposalVoteListPage.validateVoteMin('proposalWorkflowVoteE', 'ANONYMOUS')

        ParticipationWorkflowPage.loginWithCredentials({
          email: 'pierre@cap-collectif.com',
          password: 'toto',
        })

        ProposalVoteListPage.getProposalCounter('proposalWorkflowVoteD').contains('1')
        ProposalVoteListPage.getProposalCounter('proposalWorkflowVoteE').contains('1')
        ProjectHeaderPage.getVotesPointsCounter('proposalWorkflowVoteD').contains('4')
        ProjectHeaderPage.getVotesPointsCounter('proposalWorkflowVoteE').contains('3')

        ProposalVoteListPage.getProposalCounter('proposalWorkflowVoteF').contains('0')
        ProjectHeaderPage.getVotesPointsCounter('proposalWorkflowVoteF').contains('0')
        ProjectHeaderPage.getProjectHeaderVoteCounter().contains('5')
      })
      it('min = null max = 4 => should add participant votes to user votes since combination of both did not exceed max', () => {
        cy.task(
          'run:sql',
          'UPDATE step SET votes_min = null, votes_limit = 4, votes_ranking = true WHERE id = "selectionStepWorkflowVote1"',
        )
        cy.directLoginAs('pierre')
        ProposalPage.visitSelectionStepPage({
          project: 'bp-vote-parcours',
          step: 'vote-parcours-min-3-max-5',
        })
        ProposalVoteListPage.validateSimpleVote('proposalWorkflowVoteF', 'LOGGED_IN')
        ProposalVoteListPage.validateVoteMin('proposalWorkflowVoteE', 'LOGGED_IN', true)
        cy.logout()
        ProposalVoteListPage.validateSimpleVote('proposalWorkflowVoteD', 'ANONYMOUS')

        ParticipationWorkflowPage.loginWithCredentials({
          email: 'pierre@cap-collectif.com',
          password: 'toto',
        })

        ProposalVoteListPage.getProposalCounter('proposalWorkflowVoteF').contains('1')
        ProposalVoteListPage.getProposalCounter('proposalWorkflowVoteD').contains('1')
        ProposalVoteListPage.getProposalCounter('proposalWorkflowVoteE').contains('1')

        ProjectHeaderPage.getVotesPointsCounter('proposalWorkflowVoteF').contains('4')
        ProjectHeaderPage.getVotesPointsCounter('proposalWorkflowVoteE').contains('3')
        ProjectHeaderPage.getVotesPointsCounter('proposalWorkflowVoteD').contains('2')
        ProjectHeaderPage.getProjectHeaderVoteCounter().contains('6')
      })
      it('min = null max = 4 => should keep user votes positions when the participant is adding the same vote', () => {
        cy.task(
          'run:sql',
          'UPDATE step SET votes_min = null, votes_limit = 4, votes_ranking = true WHERE id = "selectionStepWorkflowVote1"',
        )
        cy.directLoginAs('pierre')
        ProposalPage.visitSelectionStepPage({
          project: 'bp-vote-parcours',
          step: 'vote-parcours-min-3-max-5',
        })
        ProposalVoteListPage.validateSimpleVote('proposalWorkflowVoteF', 'LOGGED_IN')
        ProposalVoteListPage.validateVoteMin('proposalWorkflowVoteE', 'LOGGED_IN', true)
        ProposalVoteListPage.validateVoteMin('proposalWorkflowVoteD', 'LOGGED_IN', true)
        cy.logout()
        ProposalVoteListPage.validateSimpleVote('proposalWorkflowVoteE', 'ANONYMOUS')

        ParticipationWorkflowPage.loginWithCredentials({
          email: 'pierre@cap-collectif.com',
          password: 'toto',
        })

        ProjectHeaderPage.getVotesPointsCounter('proposalWorkflowVoteF').contains('4')
        ProjectHeaderPage.getVotesPointsCounter('proposalWorkflowVoteE').contains('3')
        ProjectHeaderPage.getVotesPointsCounter('proposalWorkflowVoteD').contains('2')
        ProjectHeaderPage.getProjectHeaderVoteCounter().contains('6')

        ProposalVoteListPage.getProposalCounter('proposalWorkflowVoteF').contains('1')
        ProposalVoteListPage.getProposalCounter('proposalWorkflowVoteD').contains('1')
        ProposalVoteListPage.getProposalCounter('proposalWorkflowVoteE').contains('1')
      })
    })

    describe.skip('budget', () => {
      beforeEach(() => {
        cy.task('run:sql', 'DELETE FROM requirement WHERE step_id = "selectionStepWorkflowVote1"')
        cy.task(
          'run:sql',
          'INSERT INTO requirement (id, step_id, type, label, position) VALUES ("requirement32", "selectionStepWorkflowVote1", "EMAIL_VERIFIED", null, 2)',
        )
        cy.task('run:sql', 'UPDATE fos_user SET consent_internal_communication = 1 WHERE id = "userKiroule"')
        cy.task('run:sql', 'UPDATE proposal SET estimation = 600 WHERE id = "proposalWorkflowVoteA"')
        cy.task('run:sql', 'UPDATE proposal SET estimation = 100 WHERE id = "proposalWorkflowVoteB"')
        cy.task('run:sql', 'UPDATE proposal SET estimation = 200 WHERE id = "proposalWorkflowVoteD"')
        cy.task('run:sql', 'UPDATE proposal SET estimation = 200 WHERE id = "proposalWorkflowVoteE"')
      })
      it('min = 2 max = 4 | budget = 1000 => should keep user votes since sum of all votes exceed budget', () => {
        cy.task(
          'run:sql',
          'UPDATE step SET votes_min = 2, votes_limit = 4, budget = 1000, votes_ranking = false, vote_type = 2 WHERE id = "selectionStepWorkflowVote1"',
        )

        cy.directLoginAs('pierre')
        ProposalPage.visitSelectionStepPage({
          project: 'bp-vote-parcours',
          step: 'vote-parcours-min-3-max-5',
        })
        ProposalVoteListPage.validateVoteMin('proposalWorkflowVoteA', 'LOGGED_IN')
        ProposalVoteListPage.getBugdetSpent().contains('600')
        ProposalVoteListPage.validateVoteMin('proposalWorkflowVoteB', 'LOGGED_IN')
        ProposalVoteListPage.getBugdetSpent().contains('700')
        cy.logout()
        ProposalVoteListPage.validateVoteMin('proposalWorkflowVoteD', 'ANONYMOUS')
        ProposalVoteListPage.getBugdetSpent().contains('200')
        ProposalVoteListPage.validateVoteMin('proposalWorkflowVoteE', 'ANONYMOUS')

        ParticipationWorkflowPage.loginWithCredentials({
          email: 'pierre@cap-collectif.com',
          password: 'toto',
        })
        cy.contains('participant-already-contributed-title')

        ProposalVoteListPage.getProposalCounter('proposalWorkflowVoteA').contains('2')
        ProposalVoteListPage.getProposalCounter('proposalWorkflowVoteB').contains('2')

        ProposalVoteListPage.getProposalCounter('proposalWorkflowVoteD').contains('0')
        ProposalVoteListPage.getProposalCounter('proposalWorkflowVoteE').contains('0')

        ProposalVoteListPage.getBugdetSpent().contains('700')

        ProjectHeaderPage.getProjectHeaderVoteCounter().contains('5')
      })
      it('min = 2 max = 4 | budget = 1000 => should add participant votes since sum of all votes are within the budget', () => {
        cy.task(
          'run:sql',
          'UPDATE step SET votes_min = 2, votes_limit = 4, budget = 1000, votes_ranking = false, vote_type = 2 WHERE id = "selectionStepWorkflowVote1"',
        )

        cy.directLoginAs('pierre')
        ProposalPage.visitSelectionStepPage({
          project: 'bp-vote-parcours',
          step: 'vote-parcours-min-3-max-5',
        })
        ProposalVoteListPage.validateVoteMin('proposalWorkflowVoteA', 'LOGGED_IN')
        ProposalVoteListPage.getBugdetSpent().contains('600')
        cy.logout()
        ProposalVoteListPage.validateVoteMin('proposalWorkflowVoteD', 'ANONYMOUS')
        ProposalVoteListPage.getBugdetSpent().contains('200')
        ProposalVoteListPage.validateVoteMin('proposalWorkflowVoteE', 'ANONYMOUS')

        ParticipationWorkflowPage.loginWithCredentials({
          email: 'pierre@cap-collectif.com',
          password: 'toto',
        })

        ProposalVoteListPage.getProposalCounter('proposalWorkflowVoteA').contains('2')
        ProposalVoteListPage.getProposalCounter('proposalWorkflowVoteD').contains('1')
        ProposalVoteListPage.getProposalCounter('proposalWorkflowVoteE').contains('1')
        ProposalVoteListPage.getBugdetSpent().contains('1 000')

        // Proposal B should be disabled because we reached max budget and Proposal be cost 100
        ProposalVoteListPage.getProposalVoteButton('proposalWorkflowVoteB').should('have.class', 'disabled')

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
    cy.task('run:sql', 'DELETE FROM requirement WHERE step_id = "selectionStepWorkflowVote1"')
    cy.task('run:sql', 'UPDATE fos_user SET consent_internal_communication = 1 WHERE id = "userKiroule"')
    cy.directLoginAs('pierre')
    ProposalPage.visitSelectionStepPage({
      project: 'bp-vote-parcours',
      step: 'vote-parcours-min-3-max-5',
    })
    const userAuhtenticationState = 'LOGGED_IN'
    ProjectHeaderPage.getProjectContributorsCounter().contains('1')
    ProposalVoteListPage.validateVoteMin('proposalWorkflowVoteE', userAuhtenticationState)
    ProposalVoteListPage.validateVoteMin('proposalWorkflowVoteF', userAuhtenticationState)
    ProposalVoteListPage.validateVoteMin('proposalWorkflowVoteD', userAuhtenticationState)

    ProposalVoteListPage.getProposalCounter('proposalWorkflowVoteE').contains('1')
    ProposalVoteListPage.getProposalCounter('proposalWorkflowVoteF').contains('1')
    ProposalVoteListPage.getProposalCounter('proposalWorkflowVoteD').contains('1')
    ProjectHeaderPage.getProjectHeaderVoteCounter().contains('6')
    ProjectHeaderPage.getProjectContributorsCounter().contains('2')

    ProposalVoteListPage.deleteVote('proposalWorkflowVoteE', userAuhtenticationState)
    ProjectHeaderPage.getProjectHeaderVoteCounter().contains('3')
    ProjectHeaderPage.getProjectContributorsCounter().contains('1')
    ProposalVoteListPage.deleteVote('proposalWorkflowVoteF', userAuhtenticationState)
    ProposalVoteListPage.deleteVote('proposalWorkflowVoteD', userAuhtenticationState)

    ProposalVoteListPage.getProposalCounter('proposalWorkflowVoteE').contains('0')
    ProposalVoteListPage.getProposalCounter('proposalWorkflowVoteF').contains('0')
    ProposalVoteListPage.getProposalCounter('proposalWorkflowVoteD').contains('0')
    ProjectHeaderPage.getProjectHeaderVoteCounter().contains('3')
    ProjectHeaderPage.getProjectContributorsCounter().contains('1')
  })

  it('min = 3 max = 5 | user | requirements: YES', () => {
    cy.task('run:sql', 'DELETE FROM requirement WHERE step_id = "selectionStepWorkflowVote1"')
    cy.task(
      'run:sql',
      'UPDATE fos_user SET consent_internal_communication = 1, date_of_birth = null WHERE id = "userKiroule"',
    )
    cy.task(
      'run:sql',
      'INSERT INTO requirement (id, step_id, type, label, position) VALUES ("requirement32", "selectionStepWorkflowVote1", "DATE_OF_BIRTH", null, 2)',
    )
    cy.directLoginAs('pierre')
    ProposalPage.visitSelectionStepPage({
      project: 'bp-vote-parcours',
      step: 'vote-parcours-min-3-max-5',
    })
    const userAuhtenticationState = 'LOGGED_IN'
    ProjectHeaderPage.getProjectContributorsCounter().contains('1')
    ProposalVoteListPage.validateVoteMin('proposalWorkflowVoteE', userAuhtenticationState)
    ProposalVoteListPage.validateVoteMin('proposalWorkflowVoteF', userAuhtenticationState)
    ProposalVoteListPage.validateVoteMin('proposalWorkflowVoteD', userAuhtenticationState)

    ParticipationWorkflowPage.fillBirthDate({
      isAnonymous: false,
      date: '1990-01-01',
    })

    ProposalVoteListPage.getProposalCounter('proposalWorkflowVoteE').contains('1')
    ProposalVoteListPage.getProposalCounter('proposalWorkflowVoteF').contains('1')
    ProposalVoteListPage.getProposalCounter('proposalWorkflowVoteD').contains('1')
    ProjectHeaderPage.getProjectHeaderVoteCounter().contains('6')
    ProjectHeaderPage.getProjectContributorsCounter().contains('2')

    ProposalVoteListPage.deleteVote('proposalWorkflowVoteE', userAuhtenticationState)
    ProjectHeaderPage.getProjectHeaderVoteCounter().contains('3')
    ProjectHeaderPage.getProjectContributorsCounter().contains('1')
    ProposalVoteListPage.deleteVote('proposalWorkflowVoteF', userAuhtenticationState)
    ProposalVoteListPage.deleteVote('proposalWorkflowVoteD', userAuhtenticationState)

    ProposalVoteListPage.getProposalCounter('proposalWorkflowVoteE').contains('0')
    ProposalVoteListPage.getProposalCounter('proposalWorkflowVoteF').contains('0')
    ProposalVoteListPage.getProposalCounter('proposalWorkflowVoteD').contains('0')
    ProjectHeaderPage.getProjectHeaderVoteCounter().contains('3')
    ProjectHeaderPage.getProjectContributorsCounter().contains('1')
  })

  it('min = null max = null | user | requirements: NO', () => {
    cy.task('run:sql', 'DELETE FROM requirement WHERE step_id = "selectionStepWorkflowVote1"')
    cy.task('run:sql', 'UPDATE step SET votes_min = null, votes_limit = null WHERE id = "selectionStepWorkflowVote1"')
    cy.task('run:sql', 'UPDATE fos_user SET consent_internal_communication = 1 WHERE id = "userKiroule"')
    cy.directLoginAs('pierre')
    ProposalPage.visitSelectionStepPage({
      project: 'bp-vote-parcours',
      step: 'vote-parcours-min-3-max-5',
    })
    const userAuhtenticationState = 'LOGGED_IN'
    ProjectHeaderPage.getProjectContributorsCounter().contains('1')
    ProposalVoteListPage.validateSimpleVote('proposalWorkflowVoteE', userAuhtenticationState)
    ProjectHeaderPage.getProjectContributorsCounter().contains('2')
    ProposalVoteListPage.validateSimpleVote('proposalWorkflowVoteF', userAuhtenticationState)
    ProposalVoteListPage.validateSimpleVote('proposalWorkflowVoteD', userAuhtenticationState)

    ProposalVoteListPage.getProposalCounter('proposalWorkflowVoteE').contains('1')
    ProposalVoteListPage.getProposalCounter('proposalWorkflowVoteF').contains('1')
    ProposalVoteListPage.getProposalCounter('proposalWorkflowVoteD').contains('1')
    ProjectHeaderPage.getProjectHeaderVoteCounter().contains('6')

    ProposalVoteListPage.deleteVote('proposalWorkflowVoteE', userAuhtenticationState)
    ProjectHeaderPage.getProjectHeaderVoteCounter().contains('5')
    ProjectHeaderPage.getProjectContributorsCounter().contains('2')
    ProposalVoteListPage.deleteVote('proposalWorkflowVoteF', userAuhtenticationState)
    ProjectHeaderPage.getProjectHeaderVoteCounter().contains('4')
    ProjectHeaderPage.getProjectContributorsCounter().contains('2')
    ProposalVoteListPage.deleteVote('proposalWorkflowVoteD', userAuhtenticationState)
    ProjectHeaderPage.getProjectHeaderVoteCounter().contains('3')

    ProposalVoteListPage.getProposalCounter('proposalWorkflowVoteE').contains('0')
    ProposalVoteListPage.getProposalCounter('proposalWorkflowVoteF').contains('0')
    ProposalVoteListPage.getProposalCounter('proposalWorkflowVoteD').contains('0')
    ProjectHeaderPage.getProjectHeaderVoteCounter().contains('3')
    ProjectHeaderPage.getProjectContributorsCounter().contains('1')
  })

  it.skip('min = null max = null | user | requirements: YES', () => {
    cy.task('run:sql', 'DELETE FROM requirement WHERE step_id = "selectionStepWorkflowVote1"')
    cy.task(
      'run:sql',
      'INSERT INTO requirement (id, step_id, type, label, position) VALUES ("requirement32", "selectionStepWorkflowVote1", "DATE_OF_BIRTH", null, 2)',
    )
    cy.task(
      'run:sql',
      'UPDATE fos_user SET consent_internal_communication = 1, date_of_birth = null WHERE id = "userKiroule"',
    )
    cy.task('run:sql', 'UPDATE step SET votes_min = null, votes_limit = null WHERE id = "selectionStepWorkflowVote1"')
    cy.interceptGraphQLOperation({ operationName: 'ValidateContributionMutation' })

    cy.directLoginAs('pierre')
    ProposalPage.visitSelectionStepPage({
      project: 'bp-vote-parcours',
      step: 'vote-parcours-min-3-max-5',
    })
    const userAuhtenticationState = 'LOGGED_IN'
    ProjectHeaderPage.getProjectContributorsCounter().contains('1')
    ProposalVoteListPage.validateSimpleVote('proposalWorkflowVoteE', userAuhtenticationState)

    ParticipationWorkflowPage.fillBirthDate({
      isAnonymous: false,
      date: '1990-01-01',
    })

    cy.wait('@ValidateContributionMutation')

    cy.contains('your-participation-is-confirmed')
    ProjectHeaderPage.getProjectContributorsCounter().contains('2')

    ProposalVoteListPage.validateSimpleVote('proposalWorkflowVoteF', userAuhtenticationState)
    ProjectHeaderPage.getProjectContributorsCounter().contains('2')
    ProposalVoteListPage.validateSimpleVote('proposalWorkflowVoteD', userAuhtenticationState)
    ProjectHeaderPage.getProjectContributorsCounter().contains('2')

    ProposalVoteListPage.getProposalCounter('proposalWorkflowVoteE').contains('1')
    ProposalVoteListPage.getProposalCounter('proposalWorkflowVoteF').contains('1')
    ProposalVoteListPage.getProposalCounter('proposalWorkflowVoteD').contains('1')
    ProjectHeaderPage.getProjectHeaderVoteCounter().contains('6')

    ProposalVoteListPage.deleteVote('proposalWorkflowVoteE', userAuhtenticationState)
    ProjectHeaderPage.getProjectHeaderVoteCounter().contains('5')
    ProjectHeaderPage.getProjectContributorsCounter().contains('2')
    ProposalVoteListPage.deleteVote('proposalWorkflowVoteF', userAuhtenticationState)
    ProjectHeaderPage.getProjectHeaderVoteCounter().contains('4')
    ProjectHeaderPage.getProjectContributorsCounter().contains('2')
    ProposalVoteListPage.deleteVote('proposalWorkflowVoteD', userAuhtenticationState)
    ProjectHeaderPage.getProjectHeaderVoteCounter().contains('3')
    ProjectHeaderPage.getProjectContributorsCounter().contains('1')

    ProposalVoteListPage.getProposalCounter('proposalWorkflowVoteE').contains('0')
    ProposalVoteListPage.getProposalCounter('proposalWorkflowVoteF').contains('0')
    ProposalVoteListPage.getProposalCounter('proposalWorkflowVoteD').contains('0')
  })

  it('min = 3 max = 5 | participant | requirements: NO', () => {
    cy.task('run:sql', 'DELETE FROM requirement WHERE step_id = "selectionStepWorkflowVote1"')
    cy.task('swarrot:consume', 'elasticsearch_indexation')
    ProposalPage.visitSelectionStepPage({
      project: 'bp-vote-parcours',
      step: 'vote-parcours-min-3-max-5',
    })
    const userAuhtenticationState = 'ANONYMOUS'
    ProjectHeaderPage.getProjectContributorsCounter().contains('1')
    ProposalVoteListPage.validateVoteMin('proposalWorkflowVoteE', userAuhtenticationState)
    ProjectHeaderPage.getProjectContributorsCounter().contains('1')
    ProposalVoteListPage.validateVoteMin('proposalWorkflowVoteF', userAuhtenticationState)
    ProjectHeaderPage.getProjectContributorsCounter().contains('1')
    ProposalVoteListPage.validateVoteMin('proposalWorkflowVoteD', userAuhtenticationState)

    ParticipationWorkflowPage.fillConsentInternalCommunicationEmail({ email: null })

    ProposalVoteListPage.getProposalCounter('proposalWorkflowVoteE').contains('1')
    ProposalVoteListPage.getProposalCounter('proposalWorkflowVoteF').contains('1')
    ProposalVoteListPage.getProposalCounter('proposalWorkflowVoteD').contains('1')
    ProjectHeaderPage.getProjectHeaderVoteCounter().contains('6')
    ProjectHeaderPage.getProjectContributorsCounter().contains('2')

    ProposalVoteListPage.deleteVote('proposalWorkflowVoteE', userAuhtenticationState)
    ProjectHeaderPage.getProjectHeaderVoteCounter().contains('3')
    ProjectHeaderPage.getProjectContributorsCounter().contains('1')
    ProposalVoteListPage.deleteVote('proposalWorkflowVoteF', userAuhtenticationState)
    ProposalVoteListPage.deleteVote('proposalWorkflowVoteD', userAuhtenticationState)

    ProposalVoteListPage.getProposalCounter('proposalWorkflowVoteE').contains('0')
    ProposalVoteListPage.getProposalCounter('proposalWorkflowVoteF').contains('0')
    ProposalVoteListPage.getProposalCounter('proposalWorkflowVoteD').contains('0')
    ProjectHeaderPage.getProjectHeaderVoteCounter().contains('3')
    ProjectHeaderPage.getProjectContributorsCounter().contains('1')
  })

  it('min = 3 max = 5 | participant | requirements: YES', () => {
    cy.task('run:sql', 'DELETE FROM requirement WHERE step_id = "selectionStepWorkflowVote1"')
    cy.task(
      'run:sql',
      'INSERT INTO requirement (id, step_id, type, label, position) VALUES ("requirement32", "selectionStepWorkflowVote1", "DATE_OF_BIRTH", null, 2)',
    )
    cy.task('swarrot:consume', 'elasticsearch_indexation')
    ProposalPage.visitSelectionStepPage({
      project: 'bp-vote-parcours',
      step: 'vote-parcours-min-3-max-5',
    })
    const userAuhtenticationState = 'ANONYMOUS'
    ProjectHeaderPage.getProjectContributorsCounter().contains('1')
    ProposalVoteListPage.validateVoteMin('proposalWorkflowVoteE', userAuhtenticationState)
    ProjectHeaderPage.getProjectContributorsCounter().contains('1')
    ProposalVoteListPage.validateVoteMin('proposalWorkflowVoteF', userAuhtenticationState)
    ProjectHeaderPage.getProjectContributorsCounter().contains('1')
    ProposalVoteListPage.validateVoteMin('proposalWorkflowVoteD', userAuhtenticationState)

    ParticipationWorkflowPage.fillBirthDate({
      isAnonymous: true,
      date: '1990-01-01',
    })
    ParticipationWorkflowPage.fillConsentInternalCommunicationEmail({ email: null })

    ProposalVoteListPage.getProposalCounter('proposalWorkflowVoteE').contains('1')
    ProposalVoteListPage.getProposalCounter('proposalWorkflowVoteF').contains('1')
    ProposalVoteListPage.getProposalCounter('proposalWorkflowVoteD').contains('1')
    ProjectHeaderPage.getProjectHeaderVoteCounter().contains('6')
    ProjectHeaderPage.getProjectContributorsCounter().contains('2')

    ProposalVoteListPage.deleteVote('proposalWorkflowVoteE', userAuhtenticationState)
    ProjectHeaderPage.getProjectHeaderVoteCounter().contains('3')
    ProjectHeaderPage.getProjectContributorsCounter().contains('1')
    ProposalVoteListPage.deleteVote('proposalWorkflowVoteF', userAuhtenticationState)
    ProposalVoteListPage.deleteVote('proposalWorkflowVoteD', userAuhtenticationState)

    ProposalVoteListPage.getProposalCounter('proposalWorkflowVoteE').contains('0')
    ProposalVoteListPage.getProposalCounter('proposalWorkflowVoteF').contains('0')
    ProposalVoteListPage.getProposalCounter('proposalWorkflowVoteD').contains('0')
    ProjectHeaderPage.getProjectHeaderVoteCounter().contains('3')
  })

  it('min = null max = null | participant | requirements: NO', () => {
    cy.task('run:sql', 'DELETE FROM requirement WHERE step_id = "selectionStepWorkflowVote1"')
    cy.task('run:sql', 'UPDATE step SET votes_min = null, votes_limit = null WHERE id = "selectionStepWorkflowVote1"')
    cy.task('swarrot:consume', 'elasticsearch_indexation')
    ProposalPage.visitSelectionStepPage({
      project: 'bp-vote-parcours',
      step: 'vote-parcours-min-3-max-5',
    })
    const userAuhtenticationState = 'ANONYMOUS'
    ProjectHeaderPage.getProjectContributorsCounter().contains('1')
    ProposalVoteListPage.validateSimpleVote('proposalWorkflowVoteE', userAuhtenticationState)
    ParticipationWorkflowPage.fillConsentInternalCommunicationEmail({ email: null })
    ProjectHeaderPage.getProjectContributorsCounter().contains('2')
    ProposalVoteListPage.validateSimpleVote('proposalWorkflowVoteF', userAuhtenticationState)
    ProjectHeaderPage.getProjectContributorsCounter().contains('2')
    ProposalVoteListPage.validateSimpleVote('proposalWorkflowVoteD', userAuhtenticationState)
    ProjectHeaderPage.getProjectContributorsCounter().contains('2')

    ProposalVoteListPage.getProposalCounter('proposalWorkflowVoteE').contains('1')
    ProposalVoteListPage.getProposalCounter('proposalWorkflowVoteF').contains('1')
    ProposalVoteListPage.getProposalCounter('proposalWorkflowVoteD').contains('1')
    ProjectHeaderPage.getProjectHeaderVoteCounter().contains('6')

    ProposalVoteListPage.deleteVote('proposalWorkflowVoteE', userAuhtenticationState)
    ProjectHeaderPage.getProjectHeaderVoteCounter().contains('5')
    ProjectHeaderPage.getProjectContributorsCounter().contains('2')
    ProposalVoteListPage.deleteVote('proposalWorkflowVoteF', userAuhtenticationState)
    ProjectHeaderPage.getProjectHeaderVoteCounter().contains('4')
    ProjectHeaderPage.getProjectContributorsCounter().contains('2')
    ProposalVoteListPage.deleteVote('proposalWorkflowVoteD', userAuhtenticationState)
    ProjectHeaderPage.getProjectHeaderVoteCounter().contains('3')
    ProjectHeaderPage.getProjectContributorsCounter().contains('1')

    ProposalVoteListPage.getProposalCounter('proposalWorkflowVoteE').contains('0')
    ProposalVoteListPage.getProposalCounter('proposalWorkflowVoteF').contains('0')
    ProposalVoteListPage.getProposalCounter('proposalWorkflowVoteD').contains('0')
    ProjectHeaderPage.getProjectHeaderVoteCounter().contains('3')
  })

  it('min = null max = null | participant | requirements: YES', () => {
    cy.task('run:sql', 'DELETE FROM requirement WHERE step_id = "selectionStepWorkflowVote1"')
    cy.task('run:sql', 'UPDATE step SET votes_min = null, votes_limit = null WHERE id = "selectionStepWorkflowVote1"')
    cy.task(
      'run:sql',
      'INSERT INTO requirement (id, step_id, type, label, position) VALUES ("requirement32", "selectionStepWorkflowVote1", "DATE_OF_BIRTH", null, 2)',
    )
    cy.task('swarrot:consume', 'elasticsearch_indexation')
    ProposalPage.visitSelectionStepPage({
      project: 'bp-vote-parcours',
      step: 'vote-parcours-min-3-max-5',
    })
    const userAuhtenticationState = 'ANONYMOUS'
    ProjectHeaderPage.getProjectContributorsCounter().contains('1')
    ProposalVoteListPage.validateSimpleVote('proposalWorkflowVoteE', userAuhtenticationState)

    ParticipationWorkflowPage.fillBirthDate({
      isAnonymous: true,
      date: '1990-01-01',
    })
    ParticipationWorkflowPage.fillConsentInternalCommunicationEmail({ email: null })
    ProjectHeaderPage.getProjectContributorsCounter().contains('2')

    ProposalVoteListPage.validateSimpleVote('proposalWorkflowVoteF', userAuhtenticationState)
    ProjectHeaderPage.getProjectContributorsCounter().contains('2')
    ProposalVoteListPage.validateSimpleVote('proposalWorkflowVoteD', userAuhtenticationState)
    ProjectHeaderPage.getProjectContributorsCounter().contains('2')

    ProposalVoteListPage.getProposalCounter('proposalWorkflowVoteE').contains('1')
    ProposalVoteListPage.getProposalCounter('proposalWorkflowVoteF').contains('1')
    ProposalVoteListPage.getProposalCounter('proposalWorkflowVoteD').contains('1')
    ProjectHeaderPage.getProjectHeaderVoteCounter().contains('6')

    ProposalVoteListPage.deleteVote('proposalWorkflowVoteE', userAuhtenticationState)
    ProjectHeaderPage.getProjectHeaderVoteCounter().contains('5')
    ProjectHeaderPage.getProjectContributorsCounter().contains('2')
    ProposalVoteListPage.deleteVote('proposalWorkflowVoteF', userAuhtenticationState)
    ProjectHeaderPage.getProjectHeaderVoteCounter().contains('4')
    ProjectHeaderPage.getProjectContributorsCounter().contains('2')
    ProposalVoteListPage.deleteVote('proposalWorkflowVoteD', userAuhtenticationState)
    ProjectHeaderPage.getProjectHeaderVoteCounter().contains('3')
    ProjectHeaderPage.getProjectContributorsCounter().contains('1')

    ProposalVoteListPage.getProposalCounter('proposalWorkflowVoteE').contains('0')
    ProposalVoteListPage.getProposalCounter('proposalWorkflowVoteF').contains('0')
    ProposalVoteListPage.getProposalCounter('proposalWorkflowVoteD').contains('0')
    ProjectHeaderPage.getProjectHeaderVoteCounter().contains('3')
  })
})

describe('votes ranking', () => {
  beforeEach(() => {
    cy.task('db:restore')
    cy.task('enable:feature', 'turnstile_captcha')
  })

  it('min = 3 max = 5 | participant | requirements: YES', () => {
    cy.task('run:sql', 'DELETE FROM requirement WHERE step_id = "selectionStepWorkflowVote1"')
    cy.task(
      'run:sql',
      'INSERT INTO requirement (id, step_id, type, label, position) VALUES ("requirement32", "selectionStepWorkflowVote1", "DATE_OF_BIRTH", null, 2)',
    )
    cy.task('run:sql', 'UPDATE step SET votes_ranking = 1 WHERE id = "selectionStepWorkflowVote1"')
    cy.task('swarrot:consume', 'elasticsearch_indexation')
    ProposalPage.visitSelectionStepPage({
      project: 'bp-vote-parcours',
      step: 'vote-parcours-min-3-max-5',
    })
    const userAuhtenticationState = 'ANONYMOUS'
    ProposalVoteListPage.validateVoteMin('proposalWorkflowVoteE', userAuhtenticationState, true)
    ProposalVoteListPage.validateVoteMin('proposalWorkflowVoteF', userAuhtenticationState, true)
    ProposalVoteListPage.validateVoteMin('proposalWorkflowVoteD', userAuhtenticationState, true)

    ParticipationWorkflowPage.fillBirthDate({
      isAnonymous: true,
      date: '1990-01-01',
    })
    ParticipationWorkflowPage.fillConsentInternalCommunicationEmail({ email: null })

    ProjectHeaderPage.getVotesPointsCounter('proposalWorkflowVoteE').contains('5')
    ProjectHeaderPage.getVotesPointsCounter('proposalWorkflowVoteF').contains('4')
    ProjectHeaderPage.getVotesPointsCounter('proposalWorkflowVoteD').contains('3')

    ProposalVoteListPage.deleteVote('proposalWorkflowVoteE', userAuhtenticationState)
    ProjectHeaderPage.getVotesPointsCounter('proposalWorkflowVoteE').contains('0')
    ProjectHeaderPage.getVotesPointsCounter('proposalWorkflowVoteF').contains('0')
    ProjectHeaderPage.getVotesPointsCounter('proposalWorkflowVoteD').contains('0')
  })

  it('min = 3 max = 5 | participant | requirements: NO', () => {
    cy.task('run:sql', 'DELETE FROM requirement WHERE step_id = "selectionStepWorkflowVote1"')
    cy.task('run:sql', 'UPDATE step SET votes_ranking = 1 WHERE id = "selectionStepWorkflowVote1"')
    cy.task('swarrot:consume', 'elasticsearch_indexation')
    ProposalPage.visitSelectionStepPage({
      project: 'bp-vote-parcours',
      step: 'vote-parcours-min-3-max-5',
    })
    const userAuhtenticationState = 'ANONYMOUS'
    ProposalVoteListPage.validateVoteMin('proposalWorkflowVoteE', userAuhtenticationState, true)
    ProposalVoteListPage.validateVoteMin('proposalWorkflowVoteF', userAuhtenticationState, true)
    ProposalVoteListPage.validateVoteMin('proposalWorkflowVoteD', userAuhtenticationState, true)

    ParticipationWorkflowPage.fillConsentInternalCommunicationEmail({ email: null })

    ProjectHeaderPage.getVotesPointsCounter('proposalWorkflowVoteE').contains('5')
    ProjectHeaderPage.getVotesPointsCounter('proposalWorkflowVoteF').contains('4')
    ProjectHeaderPage.getVotesPointsCounter('proposalWorkflowVoteD').contains('3')

    ProposalVoteListPage.deleteVote('proposalWorkflowVoteE', userAuhtenticationState)
    ProjectHeaderPage.getVotesPointsCounter('proposalWorkflowVoteE').contains('0')
    ProjectHeaderPage.getVotesPointsCounter('proposalWorkflowVoteF').contains('0')
    ProjectHeaderPage.getVotesPointsCounter('proposalWorkflowVoteD').contains('0')
  })

  it('min = 3 max = 5 | user | requirements: YES', () => {
    cy.task('run:sql', 'DELETE FROM requirement WHERE step_id = "selectionStepWorkflowVote1"')
    cy.task(
      'run:sql',
      'UPDATE fos_user SET consent_internal_communication = 1, date_of_birth = null WHERE id = "userKiroule"',
    )
    cy.task(
      'run:sql',
      'INSERT INTO requirement (id, step_id, type, label, position) VALUES ("requirement32", "selectionStepWorkflowVote1", "DATE_OF_BIRTH", null, 2)',
    )
    cy.task('run:sql', 'UPDATE step SET votes_ranking = 1 WHERE id = "selectionStepWorkflowVote1"')
    cy.task('swarrot:consume', 'elasticsearch_indexation')

    cy.directLoginAs('pierre')
    ProposalPage.visitSelectionStepPage({
      project: 'bp-vote-parcours',
      step: 'vote-parcours-min-3-max-5',
    })
    const userAuhtenticationState = 'LOGGED_IN'
    ProposalVoteListPage.validateVoteMin('proposalWorkflowVoteE', userAuhtenticationState, true)
    ProposalVoteListPage.validateVoteMin('proposalWorkflowVoteF', userAuhtenticationState, true)
    ProposalVoteListPage.validateVoteMin('proposalWorkflowVoteD', userAuhtenticationState, true)

    ParticipationWorkflowPage.fillBirthDate({
      isAnonymous: false,
      date: '1990-01-01',
    })

    ProjectHeaderPage.getVotesPointsCounter('proposalWorkflowVoteE').contains('5')
    ProjectHeaderPage.getVotesPointsCounter('proposalWorkflowVoteF').contains('4')
    ProjectHeaderPage.getVotesPointsCounter('proposalWorkflowVoteD').contains('3')

    ProposalVoteListPage.deleteVote('proposalWorkflowVoteE', userAuhtenticationState)
    ProjectHeaderPage.getVotesPointsCounter('proposalWorkflowVoteE').contains('0')
    ProjectHeaderPage.getVotesPointsCounter('proposalWorkflowVoteF').contains('0')
    ProjectHeaderPage.getVotesPointsCounter('proposalWorkflowVoteD').contains('0')
  })

  it.only('min = 3 max = 5 | user | requirements: NO', () => {
    cy.task('run:sql', 'DELETE FROM requirement WHERE step_id = "selectionStepWorkflowVote1"')
    cy.task('run:sql', 'UPDATE fos_user SET consent_internal_communication = 1 WHERE id = "userKiroule"')
    cy.task('run:sql', 'UPDATE step SET votes_ranking = 1 WHERE id = "selectionStepWorkflowVote1"')
    cy.task('swarrot:consume', 'elasticsearch_indexation')

    cy.directLoginAs('pierre')
    ProposalPage.visitSelectionStepPage({
      project: 'bp-vote-parcours',
      step: 'vote-parcours-min-3-max-5',
    })
    const userAuhtenticationState = 'LOGGED_IN'
    ProposalVoteListPage.validateVoteMin('proposalWorkflowVoteE', userAuhtenticationState, true)
    ProposalVoteListPage.validateVoteMin('proposalWorkflowVoteF', userAuhtenticationState, true)
    ProposalVoteListPage.validateVoteMin('proposalWorkflowVoteD', userAuhtenticationState, true)

    ProjectHeaderPage.getVotesPointsCounter('proposalWorkflowVoteE').contains('5')
    ProjectHeaderPage.getVotesPointsCounter('proposalWorkflowVoteF').contains('4')
    ProjectHeaderPage.getVotesPointsCounter('proposalWorkflowVoteD').contains('3')

    ProposalVoteListPage.deleteVote('proposalWorkflowVoteE', userAuhtenticationState)
    ProjectHeaderPage.getVotesPointsCounter('proposalWorkflowVoteE').contains('0')
    ProjectHeaderPage.getVotesPointsCounter('proposalWorkflowVoteF').contains('0')
    ProjectHeaderPage.getVotesPointsCounter('proposalWorkflowVoteD').contains('0')
  })
})
