/* eslint-env jest */
import '../../../_setupDB'

const AddCommentVoteMutation = /* GraphQL*/ `
    mutation ($input: AddCommentVoteInput!) {
      addCommentVote(input: $input) {
        voteEdge {
            node {
                id
                published
                contribution {
                    id
                }
                author {
                    _id
                }
            }
        }
      }
    }
`

describe('mutations.addCommentVoteMutation', () => {
  it('Logged in API client wants to vote for a comment', async () => {
    await expect(
      graphql(
        AddCommentVoteMutation,
        {
          input: {
            commentId: 'Q29tbWVudDpldmVudENvbW1lbnQx',
          },
        },
        'internal_user',
      ),
    ).resolves.toMatchSnapshot()
  })
})
