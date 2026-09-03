/* eslint-env jest */

const ViewerProposalDraftsQuery = /* GraphQL */ `
  query ViewerProposalDraftsQuery($stepId: ID!) {
    step: node(id: $stepId) {
      ... on CollectStep {
        viewerProposalDrafts {
          edges {
            node {
              title
              url
            }
          }
        }
      }
    }
  }
`

describe('Internal|CollectStep.viewerProposalDrafts', () => {
  it('lists the current user draft proposals', async () => {
    await expect(
      graphql(
        ViewerProposalDraftsQuery,
        { stepId: 'Q29sbGVjdFN0ZXA6Y29sbGVjdHN0ZXAx' },
        'internal_admin',
      ),
    ).resolves.toMatchSnapshot()
  })
})
