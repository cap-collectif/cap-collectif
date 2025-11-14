/* eslint-env jest */

const UserArgumentsQuery = /* GraphQL */ `
  query UserArgumentsQuery($id: ID!, $count: Int!, $cursor: String) {
    node(id: $id) {
      ... on User {
        arguments(first: $count, after: $cursor) {
          pageInfo {
            hasNextPage
            endCursor
          }
          edges {
            cursor
            node {
              ... on Argument {
                id
                published
                publishableUntil
                publishedAt
                notPublishedReason
                kind
                url
                trashed
                trashedStatus
                trashedAt
                trashedReason
                updatedAt
                createdAt
                type
                body
                contribuable
                related {
                  id
                }
                step {
                  id
                }
                author {
                  id
                }
                reportings {
                  totalCount
                }
                votes {
                  totalCount
                }
              }
            }
          }
          totalCount
        }
      }
    }
  }
`

const UserArgumentPaginationAfterQuery = /* GraphQL */ `
  query UserArgumentPaginationQuery($count: Int!, $cursor: String) {
    node(id: "VXNlcjp1c2VyMQ==") {
      ... on User {
        id
        arguments(first: $count, after: $cursor) {
          edges {
            node {
              id
              kind
            }
          }
          totalCount
        }
      }
    }
  }
`

describe('User.arguments connection', () => {
  it("fetches a user's arguments", async () => {
    await Promise.all(
      ['user1', 'user2', 'user3', 'userAdmin'].map(async id => {
        await expect(
          graphql(
            UserArgumentsQuery,
            {
              id: global.toGlobalId('User', id),
              count: 10,
            },
            'internal',
          ),
        ).resolves.toMatchSnapshot(id)
      }),
    )
  })
})

describe('User.arguments connection pagination', () => {
  it("should paginate correctly after a user's arguments", async () => {
    await Promise.all(
      [
        'YToyOntpOjA7aToxNTE4ODI5MjAwMDAwO2k6MTtzOjExOiJhcmd1bWVudDI2MSI7fQ==',
        'YToyOntpOjA7aToxNDU2Nzk0MDAwMDAwO2k6MTtzOjExOiJhcmd1bWVudDIxMSI7fQ==',
      ].map(async cursor => {
        await expect(
          graphql(
            UserArgumentPaginationAfterQuery,
            {
              count: 5,
              cursor: cursor,
            },
            'internal',
          ),
        ).resolves.toMatchSnapshot('user1:after:' + cursor)
      }),
    )
  })
})
