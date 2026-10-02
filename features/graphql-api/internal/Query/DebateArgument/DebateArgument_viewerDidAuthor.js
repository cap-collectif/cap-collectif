/* eslint-env jest */
const DebateArgumentViewerDidAuthorQuery = /* GraphQL */ `
  query DebateArgumentViewerDidAuthorQuery($id: ID!) {
    node(id: $id) {
      ... on DebateArgument {
        viewerDidAuthor
      }
    }
  }
`

/**
 * @jest-status non-compliant
 * @jest-reason Checks only a GraphQL response snapshot; add explicit assertions for the API contract.
 */
describe('Internal|Debate.viewerDidAuthor bool', () => {
  it('fetches if viewer is the argument author', async () => {
    await expect(
      graphql(
        DebateArgumentViewerDidAuthorQuery,
        {
          id: toGlobalId('DebateArgument', 'debateArgument1'),
        },
        'internal_user',
      ),
    ).resolves.toMatchSnapshot()
  })

  it('fetches if viewer is the argument author', async () => {
    await expect(
      graphql(
        DebateArgumentViewerDidAuthorQuery,
        {
          id: toGlobalId('DebateArgument', 'debateArgument1'),
        },
        'internal_spylou',
      ),
    ).resolves.toMatchSnapshot()
  })
})
