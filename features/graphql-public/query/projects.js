/* eslint-env jest */
const TIMEOUT = 15000;

const ProjectsQuery = /* GraphQL */ `
  query ProjectsQuery($count: Int!, $cursor: String) {
    projects(first: $count, after: $cursor) {
      totalCount
      pageInfo {
        hasNextPage
        endCursor
      }
      edges {
        node {
          id
          title
          votes {
            totalCount
          }
          contributors {
            totalCount
          }
        }
      }
    }
  }
`;

describe('ProjectsQuery', () => {
  test(
    'returns correctly',
    async () => {
      await expect(
        global.client.request(ProjectsQuery, {
          count: 100,
        }),
      ).resolves.toMatchSnapshot();
    },
    TIMEOUT,
  );
});
