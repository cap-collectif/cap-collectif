/* eslint-env jest */
import '../../../../_setupDB'
import '../../../../_setupES'
import { execFile as execFileCallback } from 'child_process'
import { promisify } from 'util'

const execFile = promisify(execFileCallback)

const ChangeProposalDecisionMutation = /* GraphQL */ `
  mutation ChangeProposalDecisionMutation($input: ChangeProposalDecisionInput!) {
    changeProposalDecision(input: $input) {
      errorCode
      proposal {
        id
        officialResponse {
          authors {
            id
            url
            ... on User {
              vip
            }
            displayName
          }
        }
      }
      decision {
        isApproved
        state
        refusedReason {
          id
        }
        estimatedCost
        officialResponse {
          body
          authors {
            id
          }
        }
      }
    }
  }
`

const ChangeProposalDecisionWithAssessmentMutation = /* GraphQL */ `
  mutation ChangeProposalDecisionMutation($input: ChangeProposalDecisionInput!) {
    changeProposalDecision(input: $input) {
      errorCode
      decision {
        isApproved
        state
        proposal {
          assessment {
            state
          }
        }
      }
    }
  }
`

const ProposalDecisionQuery = /* GraphQL */ `
  query ProposalDecision($id: ID!) {
    node(id: $id) {
      ... on Proposal {
        decision {
          isApproved
          state
          estimatedCost
        }
      }
    }
  }
`

// These fixtures are assigned to the decision maker; proposal110 also has an assessment.
const assignedProposalId = toGlobalId('Proposal', 'proposal112')
const assessedProposalId = toGlobalId('Proposal', 'proposal110')
const readDecision = async proposalId => {
  const response = await graphql(ProposalDecisionQuery, { id: proposalId }, 'internal_decision_maker')
  return response.node.decision
}

/**
 * @jest-status compliant
 * @jest-reason Checks API outcomes and persisted decisions with MySQL and Elasticsearch restoration.
 */
describe('mutations.changeProposalDecision', () => {
  afterAll(async () => {
    try {
      await execFile('docker', [
        'exec',
        '-u',
        'capco',
        '-w',
        '/var/www',
        'capco_application_1',
        'bash',
        '-lc',
        process.env.CI_SHARED_TEST_DATA === '1'
          ? 'bash .circleci/profile-mysql-restore.sh'
          : 'mysql -h database -u root symfony < var/db.backup',
      ])
    } finally {
      await execFile('docker', [
        'exec',
        '-u',
        'capco',
        '-w',
        '/var/www',
        'capco_application_1',
        'php',
        'scripts/qa/elasticsearch-snapshot.php',
        'restore',
        '--confirm',
        ...(process.env.CI_SHARED_TEST_DATA === '1' ? ['--shared'] : []),
      ])
    }
  })

  it('should create a new empty proposal decision on the proposal.', async () => {
    const createDecision = await graphql(
      ChangeProposalDecisionMutation,
      {
        input: {
          proposalId: assignedProposalId,
          isApproved: true,
        },
      },
      'internal_decision_maker',
    )
    expect(createDecision.changeProposalDecision.errorCode).toBeNull()
    const expected = { isApproved: true, state: 'IN_PROGRESS', estimatedCost: 0 }
    expect(createDecision.changeProposalDecision.decision).toMatchObject(expected)
    expect(await readDecision(assignedProposalId)).toEqual(expected)
  })

  it('should modify the proposal decision.', async () => {
    const modifyDecision = await graphql(
      ChangeProposalDecisionMutation,
      {
        input: {
          proposalId: assignedProposalId,
          estimatedCost: 50000,
          body: "Je suis le body de l'article lié à la proposition sur laquelle je donne ma décision",
          authors: ['VXNlcjp1c2VyU3VwZXJ2aXNvcjI=', 'VXNlcjp1c2VyRGVjaXNpb25NYWtlcg=='],
          isApproved: true,
          isDone: true,
        },
      },
      'internal_decision_maker',
    )
    expect(modifyDecision.changeProposalDecision.errorCode).toBeNull()
    expect(modifyDecision.changeProposalDecision.decision).toMatchObject({
      isApproved: true,
      state: 'DONE',
      estimatedCost: 50000,
      officialResponse: {
        body: "Je suis le body de l'article lié à la proposition sur laquelle je donne ma décision",
        authors: [{ id: 'VXNlcjp1c2VyU3VwZXJ2aXNvcjI=' }, { id: 'VXNlcjp1c2VyRGVjaXNpb25NYWtlcg==' }],
      },
    })
    expect(await readDecision(assignedProposalId)).toEqual({ isApproved: true, state: 'DONE', estimatedCost: 50000 })
  })

  it('rejects finalization without a refusal reason and leaves the decision unchanged', async () => {
    const originalDecision = await readDecision(assignedProposalId)
    const modifyDecision = await graphql(
      ChangeProposalDecisionMutation,
      {
        input: {
          proposalId: assignedProposalId,
          authors: ['VXNlcjp1c2VyU3VwZXJ2aXNvcjI=', 'VXNlcjp1c2VyRGVjaXNpb25NYWtlcg=='],
          isApproved: false,
          isDone: true,
        },
      },
      'internal_decision_maker',
    )
    expect(modifyDecision.changeProposalDecision).toMatchObject({
      decision: null,
      errorCode: 'REFUSED_REASON_REQUIRED',
    })
    expect(await readDecision(assignedProposalId)).toEqual(originalDecision)
  })

  it('saves a draft without an approval choice on an assessed proposal', async () => {
    const createDecisionWithAssessment = await graphql(
      ChangeProposalDecisionMutation,
      {
        input: { proposalId: assessedProposalId },
      },
      'internal_decision_maker',
    )
    expect(createDecisionWithAssessment.changeProposalDecision.errorCode).toBeNull()
    const expected = { isApproved: null, state: 'IN_PROGRESS', estimatedCost: 0 }
    expect(createDecisionWithAssessment.changeProposalDecision.decision).toMatchObject(expected)
    expect(await readDecision(assessedProposalId)).toEqual(expected)
  })

  it('should change the related assessment state when the decision is taken.', async () => {
    const modifyDecisionWithAssessment = await graphql(
      ChangeProposalDecisionWithAssessmentMutation,
      {
        input: {
          proposalId: 'UHJvcG9zYWw6cHJvcG9zYWwxMDk=',
          isDone: true,
          isApproved: true,
        },
      },
      'internal_decision_maker',
    )
    expect(modifyDecisionWithAssessment.changeProposalDecision).toEqual({
      errorCode: null,
      decision: { isApproved: true, state: 'DONE', proposal: { assessment: { state: 'TOO_LATE' } } },
    })
    const persistedAssessment = await graphql(
      `
        query AssessedProposal($id: ID!) {
          node(id: $id) {
            ... on Proposal {
              assessment {
                state
              }
            }
          }
        }
      `,
      { id: toGlobalId('Proposal', 'proposal109') },
      'internal_decision_maker',
    )
    expect(persistedAssessment.node.assessment.state).toBe('TOO_LATE')
  })
})
