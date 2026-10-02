/* eslint-env jest */
const ParticipantVotes = /* GraphQL */ `
  query ParticipantVotes($participantId: ID!) {
    node(id: $participantId) {
      ... on Participant {
        id
        votes {
          totalCount
          edges {
            node {
              id
              kind
            }
          }
        }
      }
    }
  }
`

/**
 * @jest-status non-compliant
 * @jest-reason Checks only a GraphQL response snapshot; add explicit assertions for the API contract.
 */
describe('Internal|Participant.Votes', () => {
  it('super admin should be able to fetch votes from participant', async () => {
    await expect(
      graphql(
        ParticipantVotes,
        {
          participantId: toGlobalId('Participant', 'participant2'),
        },
        'internal_super_admin',
      ),
    ).resolves.toMatchSnapshot()
  })
})
