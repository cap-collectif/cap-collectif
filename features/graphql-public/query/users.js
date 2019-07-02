/* eslint-env jest */
const TIMEOUT = 15000;

const OpenDataUsersQuery = /* GraphQL */ `
  query OpenDataUsersQuery($count: Int!, $cursor: String) {
    users(first: $count, after: $cursor) {
      totalCount
      edges {
        cursor
        node {
          id
          username
          email
          consentInternalCommunication
          linkedInUrl
          twitterUrl
          websiteUrl
          facebookUrl
          createdAt
          updatedAt
          deletedAccountAt
          enabled
          biography
          url
          userType {
            name
          }
          responses {
            edges {
              node {
                ... on ValueResponse {
                  value
                  formattedValue
                }
              }
            }
          }
        }
      }
      pageInfo {
        startCursor
        hasPreviousPage
        hasNextPage
        endCursor
      }
    }
  }
`;

describe('Query.users connection', () => {
  it(
    'fetches the first hundred users with a cursor',
    async () => {
      await expect(
        graphql(OpenDataUsersQuery, {
          count: 100,
        }),
      ).resolves.toMatchSnapshot();
    },
    TIMEOUT,
  );
  it(
    'fetches the next three users with a cursor',
    async () => {
      await expect(
        graphql(OpenDataUsersQuery, {
          count: 3,
          cursor: 'YXJyYXljb25uZWN0aW9uOjk5',
        }),
      ).resolves.toMatchSnapshot();
    },
    TIMEOUT,
  );
  it(
    'fetches the five last users',
    async () => {
      await expect(
        graphql(
          `
            {
              users(first: 5, orderBy: { field: CREATED_AT, direction: DESC }) {
                edges {
                  node {
                    _id
                  }
                }
              }
            }
          `,
          {},
          'internal',
        ),
      ).resolves.toMatchSnapshot();
    },
    TIMEOUT,
  );
});
