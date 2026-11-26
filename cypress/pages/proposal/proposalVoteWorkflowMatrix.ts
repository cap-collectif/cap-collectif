import { toGlobalId } from '~e2e/helper'
import ParticipationWorkflowPage from '../admin/participationWorkflow'
import ProposalVoteListPage from './proposalVoteListPage'

type ProposalLetter = 'A' | 'B' | 'C' | 'D' | 'E' | 'F'
type VoteStatus = 'COMPLETED' | 'MISSING_REQUIREMENTS'

const mergeCases = [
  {
    name: 'keeps the account ballot when the union would exceed the maximum',
    min: 3,
    max: 5,
    account: 'ABC',
    participant: 'DEF',
    expected: 'ABC',
  },
  {
    name: 'adopts the participant ballot when it reaches the maximum first',
    alsoRunOnCollect: true,
    min: 2,
    max: 2,
    account: 'A',
    participant: 'BC',
    expected: 'BC',
  },
  {
    name: 'keeps an established ranked account ballot',
    min: 2,
    max: 4,
    ranked: true,
    account: 'AB',
    participant: 'DE',
    expected: 'AB',
  },
  {
    name: 'adopts the ranked participant ballot when only it reaches the minimum',
    min: 2,
    max: 4,
    ranked: true,
    account: 'A',
    participant: 'DE',
    expected: 'DE',
  },
  {
    name: 'appends a ranked vote without a minimum',
    min: null,
    max: 4,
    ranked: true,
    account: 'AB',
    participant: 'D',
    expected: 'ABD',
  },
  {
    name: 'preserves rank when both ballots include the same proposal',
    alsoRunOnCollect: true,
    min: null,
    max: 4,
    ranked: true,
    account: 'AB',
    participant: 'BD',
    expected: 'ABD',
  },
  {
    name: 'keeps the account ballot when the combined cost exceeds the budget',
    min: 2,
    max: 4,
    budget: 1000,
    account: 'AB',
    participant: 'DE',
    expected: 'AB',
  },
  {
    name: 'deduplicates ballots whose combined cost exactly meets the budget',
    alsoRunOnCollect: true,
    min: 2,
    max: 4,
    budget: 1000,
    account: 'AB',
    participant: 'BD',
    expected: 'ABD',
  },
] as const

export const proposalVoteWorkflowMatrix = (kind: 'collect' | 'selection', step: { project: string; step: string }) => {
  const isCollect = kind === 'collect'
  const stepId = isCollect ? 'collectStepWorkflowCollectVote' : 'selectionStepWorkflowVote1'
  const proposalPrefix = isCollect ? 'proposalWorkflowCollectVote' : 'proposalWorkflowVote'
  const titlePrefix = isCollect ? 'Proposition Collect + Vote' : 'Proposition'
  const proposalId = (letter: string) => toGlobalId('Proposal', proposalPrefix + letter)
  const voteButton = (letter: string) => cy.getByDataCy(`proposal-vote-button-${proposalId(letter)}`)
  const titles = (letters: string) => [...letters].map(letter => `${titlePrefix} ${letter}`)
  const visit = () => {
    cy.visit(`/project/${step.project}/${kind}/${step.step}`, { timeout: 120000 })
    cy.wait('@MatrixVoteStep')
    cy.wait('@MatrixVoteStepHero')
  }

  const observeVotes = () => {
    cy.interceptGraphQLOperation({ operationName: 'VoteStepQuery', alias: 'MatrixVoteStep' })
    cy.interceptGraphQLOperation({ operationName: 'VoteStepHeroQuery', alias: 'MatrixVoteStepHero' })
    cy.interceptGraphQLOperation({ operationName: 'AddProposalSmsVoteMutation' })
    cy.interceptGraphQLOperation({ operationName: 'AddProposalVoteMutation' })
    cy.interceptGraphQLOperation({ operationName: 'RemoveProposalSmsVoteMutation' })
    cy.interceptGraphQLOperation({ operationName: 'RemoveProposalVoteMutation' })
  }

  const configureStep = ({
    min,
    max,
    requirement,
    ranked = false,
    budget,
  }: {
    min: number | null
    max: number | null
    requirement?: 'DATE_OF_BIRTH' | 'EMAIL_VERIFIED'
    ranked?: boolean
    budget?: number
  }) => {
    cy.task(
      'run:sql',
      `UPDATE step SET votes_min = ${min}, votes_limit = ${max}, votes_ranking = ${Number(ranked)},
       vote_type = ${budget ? 2 : 1}, budget = ${budget ?? 'NULL'} WHERE id = '${stepId}'`,
    )
    cy.task(
      'run:sql',
      `DELETE FROM requirement WHERE step_id = '${stepId}'${requirement ? ` AND type <> '${requirement}'` : ''}`,
    )
    cy.task(
      'run:sql',
      "UPDATE fos_user SET date_of_birth = NULL, consent_internal_communication = 1 WHERE id = 'userKiroule'",
    )
    if (budget) {
      cy.task(
        'run:sql',
        `UPDATE proposal SET estimation = CASE id
         WHEN '${proposalPrefix}A' THEN 600 WHEN '${proposalPrefix}B' THEN 100
         WHEN '${proposalPrefix}D' THEN 300 WHEN '${proposalPrefix}E' THEN 200 END
         WHERE id IN ('${proposalPrefix}A', '${proposalPrefix}B', '${proposalPrefix}D', '${proposalPrefix}E')`,
      )
    }
  }

  const castVote = (letter: string, anonymous: boolean, status: VoteStatus = 'COMPLETED') => {
    const operation = anonymous ? 'AddProposalSmsVoteMutation' : 'AddProposalVoteMutation'
    voteButton(letter).should('be.visible').and('be.enabled').click()
    cy.wait(`@${operation}`).then(({ request, response }) => {
      assert.strictEqual(request.body.variables.input.proposalId, proposalId(letter))
      assert.notExists(response?.body.errors)
      const result = anonymous ? response?.body.data?.addProposalSmsVote : response?.body.data?.addProposalVote
      assert.isNull(result?.errorCode)
      assert.strictEqual(result?.vote?.completionStatus, status)
    })
    if (status === 'COMPLETED') {
      voteButton(letter).should('have.attr', 'aria-label', 'global.delete')
    }
  }

  const removeVote = (letter: string, anonymous: boolean) => {
    const operation = anonymous ? 'RemoveProposalSmsVoteMutation' : 'RemoveProposalVoteMutation'
    voteButton(letter).should('be.visible').and('be.enabled').click()
    cy.wait(`@${operation}`).then(({ request, response }) => {
      assert.strictEqual(request.body.variables.input.proposalId, proposalId(letter))
      assert.notExists(response?.body.errors)
    })
  }

  const expectPublicTotals = (totals: Record<string, number>, ranked: boolean) => {
    Object.entries(totals).forEach(([letter, total]) => {
      if (ranked) {
        cy.getByDataCy(`proposal-points-counter-${proposalId(letter)}`).should('have.text', String(total))
      } else {
        voteButton(letter).should('have.text', String(total))
      }
    })
  }

  const expectBallot = (letters: string, rankingLimit: number | null = null, firstPosition = 0) => {
    if (rankingLimit === null) {
      ProposalVoteListPage.expectParticipationBallot(titles(letters))
      return
    }

    ProposalVoteListPage.openParticipationBallot()
    const expectedTitles = titles(letters)
    cy.get('#votes-list').should('be.visible').children().should('have.length', expectedTitles.length)
    cy.get('#votes-list')
      .children()
      .each(($row, index) => {
        cy.wrap($row).should('contain.text', expectedTitles[index])
        cy.wrap($row).should('contain.text', `+${rankingLimit - firstPosition - index}pts`)
      })
  }

  const expectProjectTotals = (votes: number, contributors: number) => {
    ProposalVoteListPage.getProjectHeaderVoteCounter().should('have.text', String(votes))
    ProposalVoteListPage.getProjectContributorsCounter().should('have.text', String(contributors))
  }

  /**
   * @cypress-status compliant
   * @cypress-reason Verifies vote accounting against visible proposal and project totals.
   */
  describe('counted votes and ranking', () => {
    for (const anonymous of [true, false]) {
      for (const { min, max, ranked, collectCases } of [
        {
          min: 3,
          max: 5,
          ranked: false,
          collectCases: [{ anonymous: true, requirement: true }],
        },
        {
          min: null,
          max: null,
          ranked: false,
          collectCases: [
            { anonymous: true, requirement: false },
            { anonymous: false, requirement: true },
          ],
        },
        {
          min: 3,
          max: 5,
          ranked: true,
          collectCases: [
            { anonymous: true, requirement: false },
            { anonymous: false, requirement: true },
          ],
        },
      ]) {
        for (const requirement of [false, true]) {
          if (
            isCollect &&
            !collectCases.some(test => test.anonymous === anonymous && test.requirement === requirement)
          ) {
            continue
          }

          const voter = anonymous ? 'participant' : 'account'
          const limits = ranked ? 'ranked min 3 / max 5' : min ? 'min 3 / max 5' : 'no limits'
          it(`counts ${voter} votes with ${limits} and ${requirement ? 'a requirement' : 'no requirements'}`, () => {
            observeVotes()
            configureStep({ min, max, requirement: requirement ? 'DATE_OF_BIRTH' : undefined, ranked })
            if (!anonymous) cy.directLoginAs('pierre')
            visit()
            expectProjectTotals(3, 1)

            const letters: ProposalLetter[] = ['D', 'E', 'F']
            letters.forEach((letter, index) => {
              const needsValidation = requirement && index === (min ?? 1) - 1
              if (needsValidation) {
                cy.interceptGraphQLOperation({ operationName: 'ParticipationWorkflowModalQuery' })
                cy.interceptGraphQLOperation({ operationName: 'ValidateContributionMutation' })
              }
              castVote(letter, anonymous, needsValidation ? 'MISSING_REQUIREMENTS' : 'COMPLETED')
              if (needsValidation) {
                cy.wait('@ParticipationWorkflowModalQuery')
                ParticipationWorkflowPage.fillBirthDate({ isAnonymous: anonymous, date: '1990-01-01' })
                if (anonymous) ParticipationWorkflowPage.confirmMockedTurnstile()
                cy.wait('@ValidateContributionMutation')
                  .its('response.body')
                  .should(body => {
                    assert.notExists(body.errors)
                    assert.isString(body.data?.validateContribution?.redirectUrl)
                  })
                if (anonymous) ParticipationWorkflowPage.fillConsentInternalCommunicationEmail({ email: null })
                cy.wait('@MatrixVoteStep')
                cy.wait('@MatrixVoteStepHero')
              }
              if (min && index < min - 1) {
                expectPublicTotals({ D: 0, E: 0, F: 0 }, ranked)
                expectProjectTotals(3, 1)
              }
              if (!min) expectPublicTotals({ D: 1, E: Number(index >= 1), F: Number(index >= 2) }, false)
            })

            if (!requirement || !min) visit()
            expectBallot('DEF', ranked ? max : null)
            expectPublicTotals(ranked ? { D: 5, E: 4, F: 3 } : { D: 1, E: 1, F: 1 }, ranked)
            expectProjectTotals(6, 2)
            removeVote('D', anonymous)
            visit()
            expectBallot('EF', ranked ? max : null, 1)
            expectPublicTotals(min ? { D: 0, E: 0, F: 0 } : { D: 0, E: 1, F: 1 }, ranked)
            expectProjectTotals(min ? 3 : 5, min ? 1 : 2)
            if (!min) {
              removeVote('E', anonymous)
              removeVote('F', anonymous)
              visit()
              expectPublicTotals({ D: 0, E: 0, F: 0 }, false)
              expectProjectTotals(3, 1)
            }
          })
        }
      }
    }
  })

  /**
   * @cypress-status compliant
   * @cypress-reason Uses real browser votes and login to verify the reconciled ballot.
   */
  describe('reconciling participant and account ballots', () => {
    const cases = isCollect ? mergeCases.filter(voteCase => 'alsoRunOnCollect' in voteCase) : mergeCases
    cases.forEach(({ name, account, participant, expected, ...options }) => {
      it(name, () => {
        observeVotes()
        configureStep({ ...options, requirement: 'EMAIL_VERIFIED' })
        cy.directLoginAs('pierre')
        visit()
        for (const letter of account) castVote(letter, false)

        cy.request({ url: '/logout', followRedirect: false }).its('status').should('eq', 302)
        cy.clearCookie('PHPSESSID')
        cy.clearCookie('REMEMBERME')
        cy.task(
          'run:sql',
          "UPDATE participant SET email = 'pierre@cap-collectif.com', confirmation_token = NULL WHERE id = 'participant3'",
        )
        cy.setCookie('CapcoParticipant', btoa('fakeToken3'), { secure: true })
        visit()
        cy.isLoggedOut()
        for (const letter of participant) castVote(letter, true)

        cy.getCookie('CapcoParticipant').should('exist')
        cy.loginAs('pierre')
        cy.wait('@MatrixVoteStep')
        cy.wait('@MatrixVoteStepHero')
        cy.isLoggedIn()
        expectBallot(expected, 'ranked' in options ? options.max : null)
      })
    })
  })
}
