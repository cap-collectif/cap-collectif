/* eslint-env jest */
import '../../../_setupDB'
import '../../../_setupES'

const RemoveArgumentVoteMutation = /* GraphQL*/ `
    mutation ($input: RemoveArgumentVoteInput!) {
      removeArgumentVote(input: $input) {
        contribution {
          id
          votes(first: 0) {
            totalCount
          }
        }
        deletedVoteId
      }
    }
`

describe('mutations.removeArgumentVote', () => {
  /**
   * @jest-status non-compliant
   * @jest-reason Checks only a GraphQL response snapshot; add explicit assertions for the API contract.
   */
  it('Logged in API client wants to remove a vote for an argument', async () => {
    await expect(
      graphql(
        RemoveArgumentVoteMutation,
        {
          input: {
            argumentId: 'QXJndW1lbnQ6YXJndW1lbnQx',
          },
        },
        'internal_super_admin',
      ),
    ).resolves.toMatchSnapshot()
  })

  /**
   * @jest-status compliant
   * @jest-reason Checks an awaited explicit refusal from the real GraphQL API with controlled request inputs
   * and identity.
   */
  it('Logged in API client wants to remove a vote but has not voted', async () => {
    await expect(
      graphql(
        RemoveArgumentVoteMutation,
        {
          input: {
            argumentId: 'QXJndW1lbnQ6YXJndW1lbnQx',
          },
        },
        'internal_user',
      ),
    ).rejects.toThrowError('You have not voted for this argument.')
  })

  /**
   * @jest-status compliant
   * @jest-reason Checks an awaited explicit refusal from the real GraphQL API with controlled request inputs
   * and identity.
   */
  it('Logged in API client wants to remove a vote without requirements', async () => {
    await expect(
      graphql(
        RemoveArgumentVoteMutation,
        {
          input: {
            argumentId: 'QXJndW1lbnQ6YXJndW1lbnQyNTI=',
          },
        },
        'internal_jean',
      ),
    ).rejects.toThrowError('You dont meets all the requirements.')
  })
})
