/* eslint-env jest */

const UserDebateVotesQuery = /* GraphQL */ `
  query UserDebateVotesQuery($userId: ID!) {
    user: node(id: $userId) {
      ... on User {
        debateVotes {
          totalCount
          edges {
            node {
              id
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
describe('Internal|User.debateVotes visibility', () => {
  it('returns published debate votes to an anonymous user', async () => {
    await expect(
      graphql(UserDebateVotesQuery, { userId: toGlobalId('User', 'userTheo') }, 'internal'),
    ).resolves.toMatchSnapshot()
  })
})
