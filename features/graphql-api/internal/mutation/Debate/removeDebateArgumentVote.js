/* eslint-env jest */
import '../../../_setup'
const RemoveDebateArgumentVoteMutation = /* GraphQL */ `
  mutation RemoveDebateArgumentVoteMutation($input: RemoveDebateArgumentVoteInput!) {
    removeDebateArgumentVote(input: $input) {
      errorCode
      debateArgument {
        votes {
          totalCount
        }
        viewerHasVote
      }
      deletedDebateArgumentVoteId
    }
  }
`

describe('Internal|Mutation.removeDebateArgumentVote', () => {
  it('try to remove vote with wrong argument id', async () => {
    await expect(
      graphql(
        RemoveDebateArgumentVoteMutation,
        {
          input: {
            debateArgumentId: 'wrongId',
          },
        },
        'internal_user',
      ),
    ).resolves.toMatchSnapshot()
  })
  it('remove vote for an argument', async () => {
    await expect(
      graphql(
        RemoveDebateArgumentVoteMutation,
        {
          input: {
            debateArgumentId: toGlobalId('DebateArgument', 'debateArgument2'),
          },
        },
        'internal_spylou',
      ),
    ).resolves.toMatchSnapshot()
  })
  it('try to remove nonexistent vote for an argument', async () => {
    await expect(
      graphql(
        RemoveDebateArgumentVoteMutation,
        {
          input: {
            debateArgumentId: toGlobalId('DebateArgument', 'debateArgument4'),
          },
        },
        'internal_user',
      ),
    ).resolves.toMatchSnapshot()
  })
})
