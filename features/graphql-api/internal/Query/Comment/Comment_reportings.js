/* eslint-env jest */

const CommentReportingsQuery = /* GraphQL */ `
  query CommentReportingsQuery($commentId: ID!) {
    comment: node(id: $commentId) {
      id
      ... on Comment {
        reportings {
          totalCount
          edges {
            node {
              id
              type
            }
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
describe('Internal|Comment.reportings', () => {
  it('lists reportings for a comment', async () => {
    await expect(
      graphql(CommentReportingsQuery, { commentId: toGlobalId('Comment', 'eventComment1') }, 'internal_admin'),
    ).resolves.toMatchSnapshot()
  })
})
