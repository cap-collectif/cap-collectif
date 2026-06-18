import '../../_setupDB'

const UpdateProposalVotesWithoutVotesMutation = /* GraphQL */ `
  mutation UpdateProposalVotesMutation($input: UpdateProposalVotesInput!) {
    updateProposalVotes(input: $input) {
      step {
        id
        ... on SelectionStep {
          viewerVotes {
            totalCount
          }
        }
      }
    }
  }
`

const UpdateProposalVotesWithVotesMutation = /* GraphQL */ `
  mutation UpdateProposalVotesMutation($input: UpdateProposalVotesInput!) {
    updateProposalVotes(input: $input) {
      step {
        id
        ... on SelectionStep {
          viewerVotes {
            totalCount
            edges {
              node {
                id
                ... on ProposalVote {
                  anonymous
                }
              }
            }
          }
        }
      }
    }
  }
`

const UpdateProposalVotesWithVotesOrderedMutation = /* GraphQL */ `
  mutation UpdateProposalVotesMutation($input: UpdateProposalVotesInput!, $stepId: ID!, $isAuthenticated: Boolean!) {
    updateProposalVotes(input: $input) {
      step {
        id
        viewerVotes(orderBy: { field: POSITION, direction: ASC }) @include(if: $isAuthenticated) {
          totalCount
          edges {
            node {
              proposal {
                id
                votes(stepId: $stepId, first: 0) @include(if: $isAuthenticated) {
                  totalPointsCount
                }
              }
            }
          }
        }
      }
    }
  }
`

const UpdateProposalVotesWithVotesOrderedOnQuestionMutation = /* GraphQL */ `
  mutation UpdateProposalVotesMutation($input: UpdateProposalVotesInput!) {
    updateProposalVotes(input: $input) {
      step {
        id
        ... on CollectStep {
          viewerVotes(orderBy: { field: POSITION, direction: ASC }) {
            totalCount
            edges {
              node {
                id
              }
            }
          }
        }
      }
    }
  }
`

const UpdateProposalVotesWithVotesOrderedAfterResetMutation = /* GraphQL */ `
  mutation UpdateProposalVotesMutation($input: UpdateProposalVotesInput!) {
    updateProposalVotes(input: $input) {
      step {
        id
        viewerVotes(orderBy: { field: POSITION, direction: ASC }) {
          totalCount
          edges {
            node {
              id
              ... on ProposalVote {
                ranking
                proposal {
                  id
                }
              }
            }
          }
        }
      }
    }
  }
`

const inputVotesEmpty = {
  step: 'U2VsZWN0aW9uU3RlcDpzZWxlY3Rpb25zdGVwOA==',
  votes: [],
}

const inputWithAnonymousVote = {
  step: 'U2VsZWN0aW9uU3RlcDpzZWxlY3Rpb25zdGVwOA==',
  votes: [{ id: '1053', anonymous: true }],
}

const inputWithVotes = {
  step: 'Q29sbGVjdFN0ZXA6Y29sbGVjdHN0ZXBWb3RlQ2xhc3NlbWVudA==',
  votes: [
    {
      id: '2052',
      anonymous: false,
    },
    {
      id: '2053',
      anonymous: false,
    },
    {
      id: '2051',
      anonymous: false,
    },
  ],
}

const stepId = 'Q29sbGVjdFN0ZXA6Y29sbGVjdHN0ZXBWb3RlQ2xhc3NlbWVudA=='

const isAuthenticated = true

const inputWithAnonymousVotes = {
  step: 'Q29sbGVjdFN0ZXA6Y29sbGVjdFF1ZXN0aW9uVm90ZUF2ZWNDbGFzc2VtZW50',
  votes: [
    { id: '2054', anonymous: false },
    { id: '2055', anonymous: false },
  ],
}

describe('mutations.updateProposalVotesMutation', () => {
  const user = {
    email: 'user@test.com',
    password: 'user',
  }
  it('wants to delete everything as user anonymous votes included', async () => {
    await expect(
      graphql(UpdateProposalVotesWithVotesMutation, { input: inputWithAnonymousVote }, user),
    ).resolves.toMatchSnapshot()
  })
  it('wants to reorder his votes as user', async () => {
    await expect(
      graphql(
        UpdateProposalVotesWithVotesOrderedMutation,
        {
          input: inputWithVotes,
          stepId: stepId,
          isAuthenticated: isAuthenticated,
        },
        user,
      ),
    ).resolves.toMatchSnapshot()
  })
  it('wants to reorder votes on question as user', async () => {
    await expect(
      graphql(
        UpdateProposalVotesWithVotesOrderedOnQuestionMutation,
        {
          input: inputWithAnonymousVotes,
        },
        user,
      ),
    ).resolves.toMatchSnapshot()
  })
  it('wants to delete everything as user', async () => {
    await expect(
      graphql(UpdateProposalVotesWithoutVotesMutation, { input: inputVotesEmpty }, user),
    ).resolves.toMatchSnapshot()
  })

  it('rewrites ranking positions from the input order', async () => {
    await global.runSQL('UPDATE votes SET position = NULL WHERE id IN (2051, 2052, 2053)')

    await expect(
      graphql(UpdateProposalVotesWithVotesOrderedAfterResetMutation, { input: inputWithVotes }, user),
    ).resolves.toMatchObject({
      updateProposalVotes: {
        step: {
          viewerVotes: {
            totalCount: 3,
            edges: [
              {
                node: {
                  ranking: 0,
                  proposal: { id: toGlobalId('Proposal', 'proposal25') },
                },
              },
              {
                node: {
                  ranking: 1,
                  proposal: { id: toGlobalId('Proposal', 'proposal26') },
                },
              },
              {
                node: {
                  ranking: 2,
                  proposal: { id: toGlobalId('Proposal', 'proposal24') },
                },
              },
            ],
          },
        },
      },
    })
  })
})
