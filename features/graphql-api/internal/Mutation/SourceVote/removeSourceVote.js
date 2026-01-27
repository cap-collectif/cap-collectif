/* eslint-env jest */
import '../../../_setupDB'

const RemoveSourceVoteMutation = /* GraphQL*/ `
    mutation ($input: RemoveSourceVoteInput!) {
      removeSourceVote(input: $input) {
        deletedVoteId
      }
    }
`

describe('mutations.removeSourceVote', () => {
  it('Logged in API client wants to vote for a comment', async () => {
    await expect(
      graphql(
        RemoveSourceVoteMutation,
        {
          input: {
            sourceId: 'U291cmNlOnNvdXJjZTQz',
          },
        },
        'internal_user',
      ),
    ).resolves.toMatchSnapshot()
  })

  it('Logged in API client wants to vote for a comment without requirement', async () => {
    await expect(
      graphql(
        RemoveSourceVoteMutation,
        {
          input: {
            sourceId: 'U291cmNlOnNvdXJjZTQz',
          },
        },
        'internal_jean',
      ),
    ).rejects.toThrowError('You dont meets all the requirements.')
  })
})
