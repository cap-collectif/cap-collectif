/* eslint-env jest */
import '../../../resetDatabaseBeforeEach'

const AddProposalVoteMutation = /* GraphQL*/ `
  mutation ($input: AddProposalVoteInput!) {
    addProposalVote(input: $input) {
      errorCode
      vote {
        id
        isAccounted
        published
        proposal {
          id
        }
        author {
          _id
        }
      }
    }
  }
`

describe('mutations.addProposalVote', () => {
  it('Logged in API client wants to vote for a proposal anonymously', async () => {
    await expect(
      graphql(
        AddProposalVoteMutation,
        {
          input: {
            anonymously: true,
            stepId: 'U2VsZWN0aW9uU3RlcDpzZWxlY3Rpb25zdGVwMQ==',
            proposalId: 'UHJvcG9zYWw6cHJvcG9zYWwy',
          },
        },
        'internal_user',
      ),
    ).resolves.toMatchSnapshot({
      addProposalVote: {
        vote: {
          id: expect.any(String),
        },
      },
    })
  })

  it('Logged in API client wants to vote for a proposal in a step with vote limited but has already reached vote limit', async () => {
    await expect(
      graphql(
        AddProposalVoteMutation,
        {
          input: {
            stepId: 'U2VsZWN0aW9uU3RlcDpzZWxlY3Rpb25zdGVwOA==',
            proposalId: 'UHJvcG9zYWw6cHJvcG9zYWwxNw==',
          },
        },
        'internal_user',
      ),
    ).rejects.toThrowError('You have reached the limit of votes.')
  })

  it('Logged in API client wants to vote for a question in a step with requirements', async () => {
    await expect(
      graphql(
        AddProposalVoteMutation,
        {
          input: {
            stepId: 'U2VsZWN0aW9uU3RlcDpzZWxlY3Rpb25RdWVzdGlvblN0ZXBWb3RlQ2xhc3NlbWVudA==',
            proposalId: 'UHJvcG9zYWw6cXVlc3Rpb24x',
          },
        },
        'internal_user',
      ),
    ).resolves.toMatchSnapshot({
      addProposalVote: {
        vote: {
          id: expect.any(String),
        },
      },
    })
  })

  it('Logged in API client wants to vote for a proposal', async () => {
    await expect(
      graphql(
        AddProposalVoteMutation,
        {
          input: {
            stepId: 'U2VsZWN0aW9uU3RlcDpzZWxlY3Rpb25zdGVwMQ==',
            proposalId: 'UHJvcG9zYWw6cHJvcG9zYWwy',
          },
        },
        'internal_user',
      ),
    ).resolves.toMatchSnapshot({
      addProposalVote: {
        vote: {
          id: expect.any(String),
        },
      },
    })
  })

  it('Logged in API client wants to vote several times for a proposal in a step', async () => {
    await expect(
      graphql(
        AddProposalVoteMutation,
        {
          input: {
            stepId: 'U2VsZWN0aW9uU3RlcDpzZWxlY3Rpb25zdGVwMQ==',
            proposalId: 'UHJvcG9zYWw6cHJvcG9zYWwy',
          },
        },
        'internal_admin',
      ),
    ).rejects.toThrowError('proposal.vote.already_voted')
  })

  it('Logged in API client wants to vote for a proposal in a wrong selection step', async () => {
    await expect(
      graphql(
        AddProposalVoteMutation,
        {
          input: {
            stepId: 'U2VsZWN0aW9uU3RlcDpzZWxlY3Rpb25zdGVwMQ==',
            proposalId: 'UHJvcG9zYWw6cHJvcG9zYWwxMw==',
          },
        },
        'internal_user',
      ),
    ).rejects.toThrowError('This proposal is not associated to this selection step.')
  })

  it('Logged in API client wants to vote for a proposal in a not votable selection step', async () => {
    await expect(
      graphql(
        AddProposalVoteMutation,
        {
          input: {
            stepId: 'U2VsZWN0aW9uU3RlcDpzZWxlY3Rpb25zdGVwMg==',
            proposalId: 'UHJvcG9zYWw6cHJvcG9zYWwy',
          },
        },
        'internal_user',
      ),
    ).rejects.toThrowError('This step is not votable.')
  })

  it('Logged in API client wants to vote for a proposal in a not contribuable selection step', async () => {
    await expect(
      graphql(
        AddProposalVoteMutation,
        {
          input: {
            stepId: 'U2VsZWN0aW9uU3RlcDpzZWxlY3Rpb25zdGVwMw==',
            proposalId: 'UHJvcG9zYWw6cHJvcG9zYWwxMQ==',
          },
        },
        'internal_user',
      ),
    ).resolves.toMatchSnapshot()
  })

  it('Logged in API client wants to vote for a proposal in a not votable selection step', async () => {
    await expect(
      graphql(
        AddProposalVoteMutation,
        {
          input: {
            stepId: 'U2VsZWN0aW9uU3RlcDpzZWxlY3Rpb25zdGVwNA==',
            proposalId: 'UHJvcG9zYWw6cHJvcG9zYWw4',
          },
        },
        'internal_admin',
      ),
    ).rejects.toThrowError('proposal.vote.not_enough_credits')
  })

  it('Logged in API client wants to vote for proposals until his votes are taken into account', async () => {
    await global.enableFeatureFlag('votes_min')

    // First vote - not yet accounted (minimum not reached)
    await expect(
      graphql(
        AddProposalVoteMutation,
        {
          input: {
            stepId: 'Q29sbGVjdFN0ZXA6Y29sbGVjdFN0ZXBFeHBvcnQ=',
            proposalId: 'UHJvcG9zYWw6cHJvcG9zYWwxMzI=',
          },
        },
        'internal_admin',
      ),
    ).resolves.toMatchSnapshot({
      addProposalVote: {
        vote: {
          id: expect.any(String),
          isAccounted: false,
        },
      },
    })

    // Second vote - now accounted (minimum reached)
    await expect(
      graphql(
        AddProposalVoteMutation,
        {
          input: {
            stepId: 'Q29sbGVjdFN0ZXA6Y29sbGVjdFN0ZXBFeHBvcnQ=',
            proposalId: 'UHJvcG9zYWw6cHJvcG9zYWwxMzE=',
          },
        },
        'internal_admin',
      ),
    ).resolves.toMatchSnapshot({
      addProposalVote: {
        vote: {
          id: expect.any(String),
          isAccounted: true,
        },
      },
    })
  })
})
