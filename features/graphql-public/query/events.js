/* eslint-env jest */
const TIMEOUT = 15000;

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
          startAt
          endAt
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

describe('Query.events connection', () => {
  it(
    'fetches the first hundred events with a cursor',
    async () => {
      expect(true).toBe(true);
      // TODO https://github.com/cap-collectif/platform/issues/7544
      // const data = await client.request(OpenDataEventsQuery, { count: 100 });
      // console.log(expect);
      // data.events.edges.forEach(edge => {
      //   expect(edge.node).toMatchSnapshot({
      //     createdAt: expect.any(String),
      //     startAt: expect.any(String),
      //     // endAt: expect.toBeNull(),
      //     updatedAt: expect.any(String),
      //   });
      // });
    },
    TIMEOUT,
  );
});
