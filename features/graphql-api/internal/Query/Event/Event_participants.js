/* eslint-env jest */

const EventParticipantsQuery = /* GraphQL */ `
  query node($event: ID!) {
    event: node(id: $event) {
      ... on Event {
        participants(first: 5) {
          totalCount
          pageInfo {
            hasNextPage
          }
          edges {
            node {
              ... on User {
                _id
              }
              ... on NotRegistered {
                username
                email
              }
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
describe('Internal|Event.participants', () => {
  it('lists the participants of an event', async () => {
    await expect(
      graphql(
        EventParticipantsQuery,
        {
          event: 'RXZlbnQ6ZXZlbnQx',
        },
        'internal',
      ),
    ).resolves.toMatchSnapshot()
  })

  it('lists the registered user of an event', async () => {
    await expect(
      graphql(
        EventParticipantsQuery,
        {
          event: 'RXZlbnQ6ZXZlbnQz',
        },
        'internal',
      ),
    ).resolves.toMatchSnapshot()
  })
})
