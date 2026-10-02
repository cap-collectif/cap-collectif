/* eslint-env jest */

const InternalEventsQuery = /* GraphQL */ `
  query InternalEventsQuery($count: Int!, $cursor: String, $orderBy: EventOrder, $isFuture: Boolean) {
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
            refusedReason
            comment
          }
        }
      }
    }
  }
`

/**
 * @jest-status non-compliant
 * @jest-reason Checks only a GraphQL response snapshot; add explicit assertions for the API contract.
 */
describe('Preview|Query.events_review connection', () => {
  it('fetches all events enabled or approved', async () => {
    await expect(graphql(InternalEventsQuery, { count: 100 }, 'internal')).resolves.toMatchSnapshot()
  })
})
