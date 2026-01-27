/* eslint-env jest */
import '../../../_setupDB'

const RemoveProposalVote = /* GraphQL*/ `
  mutation ($input: RemoveProposalVoteInput!) {
    removeProposalVote(input: $input) {
      previousVoteId
      areRemainingVotesAccounted
    }
  }
`

describe('mutations.removeProposalVote', () => {
  it('Logged in API client wants to remove a vote but has not voted', async () => {
    await expect(
      graphql(
        RemoveProposalVote,
        {
          input: {
            stepId: 'U2VsZWN0aW9uU3RlcDpzZWxlY3Rpb25zdGVwMQ==',
            proposalId: 'UHJvcG9zYWw6cHJvcG9zYWwy',
          },
        },
        'internal_user',
      ),
    ).rejects.toThrowError('You have not voted for this proposal in this step.')
  })

  it('Logged in API client wants to remove a vote in a step no longer contributable', async () => {
    await expect(
      graphql(
        RemoveProposalVote,
        {
          input: {
            stepId: 'U2VsZWN0aW9uU3RlcDpzZWxlY3Rpb25zdGVwMw==',
            proposalId: 'UHJvcG9zYWw6cHJvcG9zYWwxMQ==',
          },
        },
        'internal_admin',
      ),
    ).rejects.toThrowError('This step is no longer contributable.')
  })

  it('Logged in API client wants to remove a vote', async () => {
    await expect(
      graphql(
        RemoveProposalVote,
        {
          input: {
            stepId: 'U2VsZWN0aW9uU3RlcDpzZWxlY3Rpb25zdGVwNA==',
            proposalId: 'UHJvcG9zYWw6cHJvcG9zYWw3',
          },
        },
        'internal_admin',
      ),
    ).resolves.toMatchSnapshot()
  })

  it('Logged in API client wants to remove a vote for proposal until his votes are not taken into account anymore', async () => {

    await expect(
      graphql(
        RemoveProposalVote,
        {
          input: {
            stepId: 'U2VsZWN0aW9uU3RlcDpzZWxlY3Rpb25TdGVwRXhwb3J0',
            proposalId: 'UHJvcG9zYWw6c2VsZWN0aW9uRXhwb3J0UHJvcG9zYWxzMTMz',
          },
        },
        'internal_user',
      ),
    ).resolves.toMatchSnapshot({
      removeProposalVote: {
        previousVoteId: expect.any(String),
      },
    })

    await expect(
      graphql(
        RemoveProposalVote,
        {
          input: {
            stepId: 'U2VsZWN0aW9uU3RlcDpzZWxlY3Rpb25TdGVwRXhwb3J0',
            proposalId: 'UHJvcG9zYWw6c2VsZWN0aW9uRXhwb3J0UHJvcG9zYWxzMTM0',
          },
        },
        'internal_user',
      ),
    ).resolves.toMatchSnapshot({
      removeProposalVote: {
        previousVoteId: expect.any(String),
      },
    })
  })
})
