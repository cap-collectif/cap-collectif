/* eslint-env jest */
const UserVersionsQuery = /* GraphQL */ `
  query UserVersionsQuery($id: ID!, $count: Int!, $cursor: String) {
    node(id: $id) {
      ... on User {
        opinionVersions(first: $count, after: $cursor) {
          pageInfo {
            hasNextPage
            endCursor
          }
          edges {
            cursor
            node {
              id
              createdAt
              project {
                visibility
              }
            }
          }
          totalCount
        }
      }
    }
  }
`

describe('User.opinionVersions connection', () => {
  it("fetches a user's opinionVersions when authenticated.", async () => {
    await Promise.all(
      ['VXNlcjp1c2VyQWRtaW4', 'VXNlcjp1c2VyQWRtaW4', 'VXNlcjp1c2VyMg'].map(async id => {
        await expect(
          graphql(
            UserVersionsQuery,
            {
              id: id,
              count: 5,
            },
            'internal_admin',
          ),
        ).resolves.toMatchSnapshot(id)
      }),
    )
  })

  it("fetches a user's public versions.", async () => {
    await Promise.all(
      ['VXNlcjp1c2VyQWRtaW4', 'VXNlcjp1c2VyMg'].map(async id => {
        await expect(
          graphql(
            UserVersionsQuery,
            {
              id: id,
              count: 5,
            },
            'internal',
          ),
        ).resolves.toMatchSnapshot(id)
      }),
    )
  })
})
