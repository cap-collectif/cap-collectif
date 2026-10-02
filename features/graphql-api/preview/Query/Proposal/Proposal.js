/* eslint-env jest */
import '../../../_setupES'

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

/**
 * @jest-status non-compliant
 * @jest-reason Checks only a GraphQL response snapshot; add explicit assertions for the API contract.
 */
describe('Preview.proposals', () => {
  it("fetches proposal's data", async () => {
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
