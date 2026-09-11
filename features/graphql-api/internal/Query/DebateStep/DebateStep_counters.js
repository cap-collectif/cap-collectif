/* eslint-env jest */
import '../../../_setupES'

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
