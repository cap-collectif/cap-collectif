/* eslint-env jest */
const UserAwaitingOrRefusedEventsQuery = /* GraphQL */ `
  query UserEventsQuery($id: ID!, $count: Int!, $cursor: String) {
    node(id: $id) {
      ... on User {
        awaitingOrRefusedEvents(first: $count, after: $cursor) {
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
  it("fetches a user's event in awaiting or refused review status", async () => {
    await Promise.all(
      ['user1', 'user2', 'user3', 'userAdmin', 'user5'].map(async id => {
        await expect(
          graphql(
            UserAwaitingOrRefusedEventsQuery,
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
