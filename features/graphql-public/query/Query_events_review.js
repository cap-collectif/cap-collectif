/* eslint-env jest */
const InternalEventsQuery = /* GraphQL */ `
  query InternalEventsQuery(
    $count: Int!
    $cursor: String
    $orderBy: EventOrder
    $isFuture: Boolean
  ) {
    events(first: $count, after: $cursor, orderBy: $orderBy, isFuture: $isFuture) {
      totalCount
      pageInfo {
        hasNextPage
        endCursor
      }
      edges {
        node {
          id
          title
          review {
            status
            reviewer {
              _id
            }
            reason
            comment
          }
        }
      }
    }
  }
`;

describe('Preview|Query.events_review connection', () => {
  it('fetches all events', async () => {
    await expect(
      graphql(InternalEventsQuery, { count: 100 }, 'internal'),
    ).resolves.toMatchSnapshot();
  });
});
