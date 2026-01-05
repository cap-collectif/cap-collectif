/* eslint-env jest */
import '../../../_setup'

const RemoveOpinionVote = /* GraphQL*/ `
  mutation ($input: RemoveOpinionVoteInput!) {
    removeOpinionVote(input: $input) {
      contribution {
        id
      }
      deletedVoteId
    }
  }
`

describe('mutations.removeOpinionVote', () => {
  it('Logged in API client wants to remove a vote in a not contribuable opinion', async () => {
    await expect(
      graphql(
        RemoveOpinionVote,
        {
          input: {
            opinionId: 'T3BpbmlvbjpvcGluaW9uNjM=',
          },
        },
        'internal_user',
      ),
    ).rejects.toThrowError('Uncontribuable opinion.')
  })

  it('Logged in API client wants to remove a vote but has not voted', async () => {
    await expect(
      graphql(
        RemoveOpinionVote,
        {
          input: {
            opinionId: 'T3BpbmlvbjpvcGluaW9uNTg=',
          },
        },
        'internal_user',
      ),
    ).rejects.toThrowError('You have not voted for this opinion.')
  })

  it('Logged in API client wants to remove a vote without meeting requirements', async () => {
    await expect(
      graphql(
        RemoveOpinionVote,
        {
          input: {
            opinionId: 'T3BpbmlvbjpvcGluaW9uMQ==',
          },
        },
        'internal_jean',
      ),
    ).rejects.toThrowError('You dont meets all the requirements.')
  })

  it('Logged in API client wants to remove a vote', async () => {
    await expect(
      graphql(
        RemoveOpinionVote,
        {
          input: {
            opinionId: 'T3BpbmlvbjpvcGluaW9uNTc=',
          },
        },
        'internal_admin',
      ),
    ).resolves.toMatchSnapshot()
  })
})
