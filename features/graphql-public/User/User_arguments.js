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
`;

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
        ).resolves.toMatchSnapshot(id);
      }),
    );
  });
});
