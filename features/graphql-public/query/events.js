/* eslint-env jest */
// eslint-disable-next-line no-unused-vars
const OpenDataEventsQuery = /* GraphQL */ `
  query OpenDataEventsQuery($count: Int!, $cursor: String) {
    events(first: $count, after: $cursor) {
      totalCount
      pageInfo {
        hasNextPage
        endCursor
      }
      edges {
        node {
          id
          title
          createdAt
          updatedAt
          #startAt
          #endAt
          enabled
          fullAddress
          lat
          lng
          zipCode
          body
          url
          link
          author {
            id
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
      }
    }
  }
`;

describe('Preview|Query.events connection', () => {
  it('fetches the first hundred events with a cursor', async () => {
    await expect(graphql(OpenDataEventsQuery, { count: 100 })).resolves.toMatchSnapshot();
  });
});
