/* eslint-env jest */

const CommentVotesQuery = /* GraphQL */ `
  query CommentVotesQuery($commentId: ID!) {
    comment: node(id: $commentId) {
      id
      ... on Comment {
        votes {
          totalCount
          edges {
            node {
              id
            }
          }
        }
      }
    }
  }
`

describe('Internal|Comment.votes', () => {
  it('lists votes for a comment', async () => {
    await expect(
      graphql(CommentVotesQuery, { commentId: toGlobalId('Comment', 'eventComment1') }, 'internal_admin'),
    ).resolves.toMatchSnapshot()
  })
})
