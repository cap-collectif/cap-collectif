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
        global.anonymousClient.request(OpenDataUsersQuery, {
          count: 100,
        }),
      ).resolves.toMatchSnapshot();
    },
    TIMEOUT,
  );
});
