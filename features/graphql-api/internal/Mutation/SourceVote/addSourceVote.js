/* eslint-env jest */
import '../../../_setup'

const AddSourceVoteMutation = /* GraphQL*/ `
    mutation ($input: AddSourceVoteInput!) {
      addSourceVote(input: $input) {
        voteEdge {
            node {
                id
                published
            }
        }
      }
    }
`

describe('mutations.addSourceVote', () => {
  it('Logged in API client wants to vote for a source', async () => {
    await expect(
      graphql(
        AddSourceVoteMutation,
        {
          input: {
            sourceId: 'U291cmNlOnNvdXJjZTQy',
          },
        },
        'internal_user',
      ),
    ).resolves.toMatchSnapshot({
      addSourceVote: {
        voteEdge: {
          node: {
            id: expect.any(String),
          },
        },
      },
    })
  })

  it('Logged in API client wants to vote for a source without meeting requirements', async () => {
    await expect(
      graphql(
        AddSourceVoteMutation,
        {
          input: {
            sourceId: 'U291cmNlOnNvdXJjZTQy',
          },
        },
        'internal_jean',
      ),
    ).rejects.toThrowError('You dont meets all the requirements.')
  })
})
