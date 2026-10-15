/* eslint-env jest */
import '../../../_setupESOnce'

const ProposalThemePreviewData = /* GraphQL */ `
  query ProposalThemePreviewData($collectStepId: ID!) {
    node(id: $collectStepId) {
      ... on CollectStep {
        id
        proposals(first: 100) {
          edges {
            node {
              id
              theme {
                title
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
describe('Preview.Proposal_theme', () => {
  it('fetches theme related to a proposal', async () => {
    await expect(
      graphql(
        ProposalThemePreviewData,
        {
          collectStepId: toGlobalId('CollectStep', 'collectstep1'),
        },
        'preview',
      ),
    ).resolves.toMatchSnapshot()
  })
})
