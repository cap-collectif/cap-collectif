/* eslint-env jest */
const DebateViewerHasArgumentQuery = /* GraphQL */ `
  query DebateViewerHasArgument($id: ID!) {
    node(id: $id) {
      ... on Debate {
        viewerHasArgument
      }
    }
  }
`

/**
 * @jest-status non-compliant
 * @jest-reason Checks only a GraphQL response snapshot; add explicit assertions for the API contract.
 */
describe('Internal|Debate.viewerHasArgument bool', () => {
  it('fetches if viewer has given an argument', async () => {
    await expect(
      graphql(
        DebateViewerHasArgumentQuery,
        {
          id: toGlobalId('Debate', 'debateCannabis'),
        },
        'internal_admin',
      ),
    ).resolves.toMatchSnapshot()
  })

  it('fetches if viewer has given an argument', async () => {
    await expect(
      graphql(
        DebateViewerHasArgumentQuery,
        {
          id: toGlobalId('Debate', 'debateCannabis'),
        },
        'internal_spylou',
      ),
    ).resolves.toMatchSnapshot()
  })
})
