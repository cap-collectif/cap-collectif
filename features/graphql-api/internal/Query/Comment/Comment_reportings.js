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

describe('Internal|Comment.reportings', () => {
  it('lists reportings for a comment', async () => {
    await expect(
      graphql(CommentReportingsQuery, { commentId: toGlobalId('Comment', 'eventComment1') }, 'internal_admin'),
    ).resolves.toMatchSnapshot()
  })
})
