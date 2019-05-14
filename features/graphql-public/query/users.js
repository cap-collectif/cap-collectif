/* eslint-env jest */
const TIMEOUT = 15000;

const OpenDataUsersQuery = /* GraphQL */ `
  query OpenDataUsersQuery($count: Int!, $cursor: String) {
    users(first: $count, after: $cursor) {
      totalCount
      edges {
        node {
          id
          username
        }
      }
      pageInfo {
        hasNextPage
        endCursor
      }
    }
  }
`;

describe('OpenDataUsersQuery', () => {
  test(
    'OpenDataUsersQuery',
    async () => {
      await expect(
        global.client.request(OpenDataUsersQuery, {
          count: 100,
        }),
      ).resolves.toMatchSnapshot();
    },
    TIMEOUT,
  );
});
