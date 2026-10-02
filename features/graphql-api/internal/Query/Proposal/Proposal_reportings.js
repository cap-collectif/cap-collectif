/* eslint-env jest */

const ProposalReportingsQuery = /* GraphQL */ `
  query ProposalReportingsQuery($proposalId: ID!) {
    proposal: node(id: $proposalId) {
      id
      ... on Proposal {
        reportings {
          totalCount
          edges {
            node {
              id
              body
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
describe('Internal|Proposal.reportings', () => {
  it('lists reportings for a proposal', async () => {
    await expect(
      graphql(ProposalReportingsQuery, { proposalId: 'UHJvcG9zYWw6cHJvcG9zYWwx' }, 'internal_admin'),
    ).resolves.toMatchSnapshot()
  })
})
