/* eslint-env jest */
import '../../../_setup'

const AddArgumentVoteMutation = /* GraphQL*/ `
    mutation ($input: AddArgumentVoteInput!) {
      addArgumentVote(input: $input) {
        voteEdge {
            node {
                id
                published
                related {
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

describe('mutations.addArgumentVoteMutation', () => {
  it('Logged in API client wants to vote for an argument', async () => {
    await expect(
      graphql(
        AddArgumentVoteMutation,
        {
          input: {
            argumentId: 'QXJndW1lbnQ6YXJndW1lbnQx',
          },
        },
        'internal_user',
      ),
    ).resolves.toMatchSnapshot()
  })

  it('Logged in API client can not vote for a trashed argument', async () => {
    await expect(
      graphql(
        AddArgumentVoteMutation,
        {
          input: {
            argumentId: 'QXJndW1lbnQ6YXJndW1lbnQxMDE=',
          },
        },
        'internal_user',
      ),
    ).rejects.toThrowError('Uncontribuable argument.')
  })

  it('Logged in API client can not vote for a argument in a closed step', async () => {
    await expect(
      graphql(
        AddArgumentVoteMutation,
        {
          input: {
            argumentId: 'QXJndW1lbnQ6YXJndW1lbnQyMDE=',
          },
        },
        'internal_user',
      ),
    ).rejects.toThrowError('Uncontribuable argument.')
  })

  it('Logged in API client wants to vote for an argument without requirements', async () => {
    await expect(
      graphql(
        AddArgumentVoteMutation,
        {
          input: {
            argumentId: 'QXJndW1lbnQ6YXJndW1lbnQyNTE=',
          },
        },
        'internal_jean',
      ),
    ).rejects.toThrowError('You dont meets all the requirements.')
  })
})
