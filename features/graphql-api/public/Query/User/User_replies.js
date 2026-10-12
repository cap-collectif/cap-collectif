/* eslint-env jest */

const UserRepliesQuery = /* GraphQL */ `
  query UserRepliesQuery($id: ID!) {
    node(id: $id) {
      ... on User {
        replies {
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
describe('User.replies connection', () => {
  it('counts only profile-visible replies for anonymous visitors', async () => {
    await Promise.all(
      [
        ['user1', 2],
        ['user2', 0],
        ['user3', 0],
        ['userAdmin', 3],
        ['adminCapco', 0],
        ['user5', 0],
        ['user_not_confirmed', 0],
      ].map(async ([id, totalCount]) => {
        await expect(
          graphql(
            UserRepliesQuery,
            {
              id: global.toGlobalId('User', id),
            },
            'internal',
          ),
        ).resolves.toEqual({ node: { replies: { totalCount } } })
      }),
    )
  })
})
