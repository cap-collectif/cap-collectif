/* eslint-env jest */
const UserEventsQuery = /* GraphQL */ `
  query UserEventsQuery($id: ID!, $count: Int!, $cursor: String) {
    node(id: $id) {
      ... on User {
        events(first: $count, after: $cursor) {
          pageInfo {
            hasNextPage
            endCursor
          }
          edges {
            cursor
            node {
              ... on Event {
                id
                title
                review {
                  status
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

describe('User.events connection', () => {
  it("fetches a user's events", async () => {
    await Promise.all(
      ['user1', 'user2', 'user3', 'userAdmin', 'user5'].map(async id => {
        await expect(
          graphql(
            UserEventsQuery,
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
