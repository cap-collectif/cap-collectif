/* eslint-env jest */
import '../../../_setupDB'

const updateProposalVoteMutation = /* GraphQL */ `
  mutation ($input: UpdateProposalVotesInput!) {
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

const reorderVotesMutation = /* GraphQL */ `
  mutation ($input: UpdateProposalVotesInput!, $stepId: ID!, $isAuthenticated: Boolean!) {
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

const questionReorderVotesMutation = /* GraphQL */ `
  mutation ($input: UpdateProposalVotesInput!) {
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

describe('Internal|update proposal vote', () => {
  it('Logged in API client wants to delete all votes', async () => {
    const response = await graphql(
      updateProposalVoteMutation,
      {
        input: {
          step: 'U2VsZWN0aW9uU3RlcDpzZWxlY3Rpb25zdGVwOA==',
          votes: [],
        },
      },
      'internal_user',
    )
    expect(response).toMatchSnapshot()
  })

  it('Logged in API client wants to update with an anonymous vote', async () => {
    const response = await graphql(
      updateProposalVoteMutation,
      {
        input: {
          step: 'U2VsZWN0aW9uU3RlcDpzZWxlY3Rpb25zdGVwOA==',
          votes: [{ id: '1053', anonymous: true }],
        },
      },
      'internal_user',
    )
    expect(response).toMatchSnapshot()
  })

  it('Logged in API client wants to reorder his votes', async () => {
    const response = await graphql(
      reorderVotesMutation,
      {
        input: {
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
        },
        stepId: 'Q29sbGVjdFN0ZXA6Y29sbGVjdHN0ZXBWb3RlQ2xhc3NlbWVudA==',
        isAuthenticated: true,
      },
      'internal_user',
    )
    expect(response).toMatchSnapshot()
  })

  it('Logged in API client wants to reorder his votes on question', async () => {
    const response = await graphql(
      questionReorderVotesMutation,
      {
        input: {
          step: 'Q29sbGVjdFN0ZXA6Y29sbGVjdFF1ZXN0aW9uVm90ZUF2ZWNDbGFzc2VtZW50',
          votes: [
            { id: '2054', anonymous: false },
            { id: '2055', anonymous: false },
          ],
        },
      },
      'internal_user',
    )
    expect(response).toMatchSnapshot()
  })
})
