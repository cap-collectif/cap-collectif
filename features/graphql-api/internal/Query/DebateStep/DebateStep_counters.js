/* eslint-env jest */
import '../../../_setupESOnce'

const DebateStepCountersQuery = /* GraphQL */ `
  query DebateStepCounters($id: ID!) {
    node(id: $id) {
      ... on DebateStep {
        contributions {
          totalCount
        }
        participants {
          totalCount
        }
        votes {
          totalCount
        }
      }
    }
  }
`

/**
 * @jest-status non-compliant
 * @jest-reason Checks only a GraphQL response snapshot; add explicit assertions for the API contract.
 */
describe('Internal|DebateStep counters', () => {
  it('fetches debate step counters with BO participant rules', async () => {
    await expect(
      graphql(
        DebateStepCountersQuery,
        {
          id: toGlobalId('DebateStep', 'debateStepCannabis'),
        },
        'internal',
      ),
    ).resolves.toMatchSnapshot()
  })
})
