const ProposalPreviewData = /* GraphQL */ `
  query ProposalPreviewDataQuery($collectStepId: ID!) {
    node(id: $collectStepId) {
      ... on CollectStep {
        id
        proposals(first: 3) {
          edges {
            node {
              id
              body
              bodyText
              summary
              address {
                formatted
              }
            }
          }
        }
      }
    }
  }
`

describe('Preview.proposals', () => {
  it("fetches proposal's data", async () => {
    await global.enableFeatureFlag('public_api')
    await expect(
      graphql(
        ProposalPreviewData,
        {
          collectStepId: toGlobalId('CollectStep', 'collectstep1'),
        },
        'preview',
      ),
    ).resolves.toMatchSnapshot()
  })
})
