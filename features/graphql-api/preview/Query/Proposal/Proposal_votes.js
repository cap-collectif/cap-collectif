/* eslint-env jest */
import '../../../_setupESOnce'

const ProposalVotesPreviewData = /* GraphQL */ `
  query ProposalVotesPreviewData($collectStepId: ID!) {
    node(id: $collectStepId) {
      ... on CollectStep {
        id
        proposals(first: 100) {
          edges {
            node {
              id
              votes(first: 100) {
                totalCount
                edges {
                  node {
                    id
                    createdAt
                    published
                    notPublishedReason
                    publishedAt
                  }
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
describe('Preview.Proposal_votes', () => {
  it("fetches votes's related to a proposal", async () => {
    await expect(
      graphql(
        ProposalVotesPreviewData,
        {
          collectStepId: toGlobalId('CollectStep', 'collectstep5'),
        },
        'preview',
      ),
    ).resolves.toMatchSnapshot()
  })
})
