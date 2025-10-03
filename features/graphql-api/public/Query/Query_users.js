/* eslint-env jest */
// TODO remove writes from tests.
import '../../_setup';

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

describe('Preview|Query.users connection', () => {
  it('fetches the first hundred users with a cursor', async () => {
    await expect(
      graphql(
        OpenDataUsersQuery,
        {
          count: 100,
        },
        'internal',
      ),
    ).resolves.toMatchSnapshot();
  });
  it('fetches the next three users with a cursor', async () => {
    await expect(
      graphql(
        OpenDataUsersQuery,
        {
          count: 5,
          cursor: 'YToyOntpOjA7aToxNDgzMjM0ODYwMDAwO2k6MTtzOjc6InVzZXIxMDEiO30=',
        },
        'internal',
      ),
    ).resolves.toMatchSnapshot();
  });
  it('fetches the five last users', async () => {
    await expect(
      graphql(
        `
          {
            users(first: 5, orderBy: { field: CREATED_AT, direction: DESC }) {
              edges {
                node {
                  _id
                  createdAt
                }
              }
            }
          }
        `,
        {},
        'internal',
      ),
    ).resolves.toMatchSnapshot();
  });

  it('fetches the five first users, including super admins.', async () => {
    await expect(
      graphql(
        `
          {
            users(first: 5, superAdmin: true) {
              edges {
                node {
                  _id
                  isSuperAdmin
                }
              }
            }
          }
        `,
        {},
        'internal_admin',
      ),
    ).resolves.toMatchSnapshot();
  });
});
