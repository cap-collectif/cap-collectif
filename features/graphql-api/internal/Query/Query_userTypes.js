/* eslint-env jest */
const UserTypes = /* GraphQL */ `
  query UserTypes {
    userTypes {
      totalCount
      pageInfo {
        hasPreviousPage
        hasNextPage
        endCursor
        startCursor
      }
      edges {
        node {
          id
          name
          translations {
            name
            locale
            slug
          }
          media {
            id
            name
            url
            size
            description
            enabled
            height
            width
            authorName
            contentType
            copyright
            providerReference
          }
        }
      }
    }
  }
`;

describe('Internal|Query.userTypes', () => {
  it('fetches all user types', async () => {
    await expect(graphql(UserTypes, null, 'internal_admin')).resolves.toMatchSnapshot();
  });
});
