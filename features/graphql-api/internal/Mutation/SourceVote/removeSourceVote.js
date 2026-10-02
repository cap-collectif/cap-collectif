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
  /**
   * @jest-status non-compliant
   * @jest-reason Checks only a GraphQL response snapshot; add explicit assertions for the API contract.
   */
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

  /**
   * @jest-status compliant
   * @jest-reason Checks an awaited explicit refusal from the real GraphQL API with controlled request inputs
   * and identity.
   */
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
