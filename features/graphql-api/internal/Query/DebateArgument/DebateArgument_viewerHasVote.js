/* eslint-env jest */
const DebateArgumentViewerHasVoteQuery = /* GraphQL */ `
  query DebateArgumentViewerHasVoteQuery($id: ID!) {
    node(id: $id) {
      ... on DebateArgument {
        viewerHasVote
      }
    }
  }
`

/**
 * @jest-status non-compliant
 * @jest-reason Checks only a GraphQL response snapshot; add explicit assertions for the API contract.
 */
describe('Internal|Debate.viewerHasVote bool', () => {
  it('fetches debate not voted by viewer', async () => {
    await expect(
      graphql(
        DebateArgumentViewerHasVoteQuery,
        {
          id: toGlobalId('DebateArgument', 'debateArgument2'),
        },
        'internal_user',
      ),
    ).resolves.toMatchSnapshot()
  })

  it('fetches debate voted by viewer', async () => {
    await expect(
      graphql(
        DebateArgumentViewerHasVoteQuery,
        {
          id: toGlobalId('DebateArgument', 'debateArgument2'),
        },
        'internal_spylou',
      ),
    ).resolves.toMatchSnapshot()
  })
})
