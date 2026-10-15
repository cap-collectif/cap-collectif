/* eslint-env jest */
import '../../../_setupESOnce'

const ProposalSelectionsPreviewData = /* GraphQL */ `
  query ProposalSelectionsPreviewData($collectStepId: ID!) {
    node(id: $collectStepId) {
      ... on CollectStep {
        id
        proposals(first: 100) {
          edges {
            node {
              id
              selections {
                step {
                  id
                }
                status {
                  name
                }
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
describe('Preview.Proposal_selections', () => {
  it('fetches selections related to a proposal', async () => {
    await expect(
      graphql(
        ProposalSelectionsPreviewData,
        {
          collectStepId: toGlobalId('CollectStep', 'collectstep1'),
        },
        'preview',
      ),
    ).resolves.toMatchSnapshot()
  })
})
