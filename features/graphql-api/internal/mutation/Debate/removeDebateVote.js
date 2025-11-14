/* eslint-env jest */
import '../../../_setup'

const RemoveDebateVoteMutation = /* GraphQL */ `
  mutation RemoveDebateVoteMutation($input: RemoveDebateVoteInput!) {
    removeDebateVote(input: $input) {
      errorCode
      deletedVoteId
      deletedArgumentId
      debate {
        id
        votes(isPublished: true) {
          totalCount
          edges {
            node {
              id
            }
          }
        }
        arguments(isPublished: true, isTrashed: false) {
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
`

describe('Internal|RemoveDebateVote mutation', () => {
  it('Remove a debate vote.', async () => {
    const response = await graphql(
      RemoveDebateVoteMutation,
      {
        input: {
          debateId: toGlobalId('Debate', 'debateCannabis'),
        },
      },
      'internal_spylou',
    )
    expect(response).toMatchSnapshot()
  })
  it('Throw unknown debate.', async () => {
    const response = await graphql(
      RemoveDebateVoteMutation,
      {
        input: {
          debateId: toGlobalId('Debate', 'debateUnknown'),
        },
      },
      'internal_spylou',
    )
    expect(response).toMatchSnapshot()
  })
  it('Throw no vote found.', async () => {
    const response = await graphql(
      RemoveDebateVoteMutation,
      {
        input: {
          debateId: toGlobalId('Debate', 'debateOpenWithoutVote'),
        },
      },
      'internal_user',
    )
    expect(response).toMatchSnapshot()
  })
  it('Throw closed debate.', async () => {
    const response = await graphql(
      RemoveDebateVoteMutation,
      {
        input: {
          debateId: toGlobalId('Debate', 'debateConfinement'),
        },
      },
      'internal_spylou',
    )
    expect(response).toMatchSnapshot()
  })
})
