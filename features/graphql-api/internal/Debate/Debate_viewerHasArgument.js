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
