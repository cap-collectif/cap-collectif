/* eslint-env jest */
import '../../../_setupDB'

const AddOpinionVoteMutation = /* GraphQL*/ `
  mutation ($input: AddOpinionVoteInput!) {
    addOpinionVote(input: $input) {
      vote {
        id
        published
        related {
          id
        }
        author {
          _id
        }
      }
      previousVoteId
    }
  }
`

describe('mutations.AddOpinionVoteMutation', () => {
  it('Logged in API client wants to vote for an opinion', async () => {
    await expect(
      graphql(
        AddOpinionVoteMutation,
        {
          input: {
            opinionId: 'T3BpbmlvbjpvcGluaW9uNTc=',
            value: 'YES',
          },
        },
        'internal_user',
      ),
    ).resolves.toMatchSnapshot({
      addOpinionVote: {
        vote: {
          id: expect.any(String),
        },
      },
    })
  })

  it('Logged in API client wants to vote for an opinion not contributable', async () => {
    await expect(
      graphql(
        AddOpinionVoteMutation,
        {
          input: {
            opinionId: 'T3BpbmlvbjpvcGluaW9uNjM=',
            value: 'YES',
          },
        },
        'internal_user',
      ),
    ).rejects.toThrowError('Uncontribuable opinion.')
  })

  it('Logged in API client wants to update an existing vote', async () => {
    await expect(
      graphql(
        AddOpinionVoteMutation,
        {
          input: {
            opinionId: 'T3BpbmlvbjpvcGluaW9uNTc=',
            value: 'NO',
          },
        },
        'internal_admin',
      ),
    ).resolves.toMatchSnapshot({
      addOpinionVote: {
        vote: {
          id: expect.any(String),
        },
      },
    })
  })

  it('Logged in API client wants to vote for an opinion without requirement', async () => {
    await expect(
      graphql(
        AddOpinionVoteMutation,
        {
          input: {
            opinionId: 'T3BpbmlvbjpvcGluaW9uMQ==',
            value: 'YES',
          },
        },
        'internal_jean',
      ),
    ).rejects.toThrowError('You dont meets all the requirements.')
  })
})
