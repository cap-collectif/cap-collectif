/* eslint-env jest */

const CommentableCommentsQuery = /* GraphQL */ `
  query CommentableCommentsQuery($proposalId: ID!, $eventId: ID!, $postId: ID!) {
    commentables: nodes(ids: [$proposalId, $eventId, $postId]) {
      ... on Commentable {
        comments(first: 3) {
          edges {
            cursor
            node {
              id
            }
          }
        }
      }
    }
  }
`

describe('Internal|Commentable.comments', () => {
  it('lists comments for commentables', async () => {
    await expect(
      graphql(
        CommentableCommentsQuery,
        {
          proposalId: toGlobalId('Proposal', 'proposal1'),
          eventId: toGlobalId('Event', 'event1'),
          postId: toGlobalId('Post', '1'),
        },
        'internal',
      ),
    ).resolves.toMatchSnapshot()
  })
})
