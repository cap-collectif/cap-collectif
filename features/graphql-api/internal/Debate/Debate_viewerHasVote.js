/* eslint-env jest */
const DebateViewerHasVoteQuery = /* GraphQL */ `
  query DebateVotesQuery($id: ID!) {
    node(id: $id) {
      ... on Debate {
        viewerHasVote
        viewerVote {
          type
        }
      }
    }
  }
`

describe('Internal|Debate.viewerHasVote bool', () => {
  it('fetches debate not voted by viewer', async () => {
    await expect(
      graphql(
        DebateViewerHasVoteQuery,
        {
          id: toGlobalId('Debate', 'debateCannabis'),
        },
        'internal_user',
      ),
    ).resolves.toMatchSnapshot()
  })

  it('fetches debate voted by viewer', async () => {
    await expect(
      graphql(
        DebateViewerHasVoteQuery,
        {
          id: toGlobalId('Debate', 'debateCannabis'),
        },
        'internal_spylou',
      ),
    ).resolves.toMatchSnapshot()
  })
})
