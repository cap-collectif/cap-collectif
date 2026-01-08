/* eslint-env jest */
import '../../../_setupWithES'

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
