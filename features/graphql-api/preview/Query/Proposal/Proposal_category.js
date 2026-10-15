/* eslint-env jest */
import '../../../_setupESOnce'

const ProposalCategoryPreviewData = /* GraphQL */ `
  query ProposalCategoryPreviewData($collectStepId: ID!) {
    node(id: $collectStepId) {
      ... on CollectStep {
        id
        proposals(first: 100) {
          edges {
            node {
              id
              category {
                name
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
describe('Preview.Proposal_category', () => {
  it('fetches category related to a proposal', async () => {
    await expect(
      graphql(
        ProposalCategoryPreviewData,
        {
          collectStepId: toGlobalId('CollectStep', 'collectstep1'),
        },
        'preview',
      ),
    ).resolves.toMatchSnapshot()
  })
})
