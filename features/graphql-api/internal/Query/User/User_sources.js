/* eslint-env jest */

const UserSourcesQuery = /* GraphQL */ `
  query UserSourcesQuery($userId: ID!) {
    user: node(id: $userId) {
      ... on User {
        id
        sources {
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
describe('Internal|User.sources visibility', () => {
  it('returns user5 sources to an admin', async () => {
    await expect(
      graphql(UserSourcesQuery, { userId: toGlobalId('User', 'user5') }, 'internal_admin'),
    ).resolves.toMatchSnapshot()
  })
})
