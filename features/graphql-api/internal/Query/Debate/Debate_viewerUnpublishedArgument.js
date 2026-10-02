/* eslint-env jest */
const DebateViewerUnpublishedArgumentQuery = /* GraphQL */ `
  query DebateViewerUnpublishedArgument($id: ID!) {
    debate: node(id: $id) {
      ... on Debate {
        viewerUnpublishedArgument {
          id
          published
        }
      }
    }
  }
`

/**
 * @jest-status compliant
 * @jest-reason Checks an explicit result or refusal from the real GraphQL read contract using stable fixture
 * data.
 */
describe('Internal|Debate.viewerUnpublishedArgument', () => {
  const variables = {
    id: toGlobalId('Debate', 'debateCannabis'),
  }

  it('should return null when the user is anonymous', async () => {
    const { debate } = await graphql(DebateViewerUnpublishedArgumentQuery, variables, 'internal')
    expect(debate.viewerUnpublishedArgument).toBe(null)
  })

  it('should return null when a user does not have an unpublished argument', async () => {
    const { debate } = await graphql(DebateViewerUnpublishedArgumentQuery, variables, 'internal_admin')
    expect(debate.viewerUnpublishedArgument).toBe(null)
  })
})
