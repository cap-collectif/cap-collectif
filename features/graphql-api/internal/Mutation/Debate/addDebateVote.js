/* eslint-env jest */
import '../../../_setupWithES'

const AddDebateVoteMutation = /* GraphQL */ `
  mutation AddDebateVoteMutation($input: AddDebateVoteInput!) {
    addDebateVote(input: $input) {
      errorCode
      previousVoteId
      debateVote {
        id
        published
        publishedAt
        publishableUntil
        notPublishedReason
        debate {
          id
          votes {
            totalCount
          }
        }
        type
        createdAt
        author {
          id
        }
      }
    }
  }
`

const AddDebateVoteAndGetOriginMutation = /* GraphQL */ `
  mutation AddDebateVoteMutation($input: AddDebateVoteInput!) {
    addDebateVote(input: $input) {
      debateVote {
        origin
        widgetOriginUrl
      }
    }
  }
`

describe('Internal|addDebateVote mutation', () => {
  it('Add and update a debate vote.', async () => {
    const response = await graphql(
      AddDebateVoteMutation,
      {
        input: {
          debateId: toGlobalId('Debate', 'debateCannabis'),
          type: 'FOR',
        },
      },
      'internal_admin',
    )

    expect(response).toMatchSnapshot({
      addDebateVote: {
        debateVote: {
          id: expect.any(String),
          createdAt: expect.any(String),
          publishedAt: expect.any(String),
        },
      },
    })

    const updateResponse = await graphql(
      AddDebateVoteMutation,
      {
        input: {
          debateId: toGlobalId('Debate', 'debateCannabis'),
          type: 'AGAINST',
        },
      },
      'internal_admin',
    )

    expect(updateResponse).toMatchSnapshot({
      addDebateVote: {
        previousVoteId: expect.any(String),
        debateVote: {
          id: expect.any(String),
          createdAt: expect.any(String),
          publishedAt: expect.any(String),
        },
      },
    })
    // The previous vote id must correspond to the deleted vote.
    expect(response.addDebateVote.debateVote.id).toBe(updateResponse.addDebateVote.previousVoteId)
  })

  it('Add a vote by widget.', async () => {
    const response = await graphql(
      AddDebateVoteAndGetOriginMutation,
      {
        input: {
          debateId: toGlobalId('Debate', 'debateCannabis'),
          type: 'FOR',
          widgetOriginURI: 'www.lejournaldesdebats.fr',
        },
      },
      'internal_admin',
    )

    expect(response).toMatchSnapshot({
      addDebateVote: {
        debateVote: {
          origin: 'WIDGET',
          widgetOriginUrl: 'www.lejournaldesdebats.fr',
        },
      },
    })
  })
})
