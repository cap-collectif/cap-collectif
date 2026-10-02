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
  it("fetches a user's published, non-draft, public replies", async () => {
    await Promise.all(
      ['user1', 'user2', 'user3', 'userAdmin', 'adminCapco', 'user5', 'user_not_confirmed'].map(async id => {
        await expect(
          graphql(
            UserRepliesQuery,
            {
              id: global.toGlobalId('User', id),
            },
            'internal',
          ),
        ).resolves.toMatchSnapshot(id)
      }),
    )
  })
})
