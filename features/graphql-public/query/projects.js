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
        cursor
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

describe('Query.projects connection', () => {
  it(
    'fetches the public projects with a cursor',
    async () => {
      await expect(
        graphql(ProjectsQuery, {
          count: 100,
        }),
      ).resolves.toMatchSnapshot();
    },
    TIMEOUT,
  );

  it(
    'fetches the public and private projects with a cursor',
    async () => {
      await expect(
        graphql(
          ProjectsQuery,
          {
            count: 100,
          },
          'admin',
        ),
      ).resolves.toMatchSnapshot();
    },
    TIMEOUT,
  );
});
