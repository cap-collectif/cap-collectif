const ProposalAnalystsQuery = /* GraphQL */ `
  query getProposalAnalysts($id: ID!) {
    proposal: node(id: $id) {
      ... on Proposal {
        viewerCanAnalyse
        analysts {
          id
        }
      }
    }
  }
`

/**
 * @jest-status non-compliant
 * @jest-reason Checks only a GraphQL response snapshot; add explicit assertions for the API contract.
 */
describe('Internal.analysts', () => {
  it("fetches proposal's related analysts when authenticated as analyst.", async () => {
    await expect(
      graphql(
        ProposalAnalystsQuery,
        {
          id: 'UHJvcG9zYWw6cHJvcG9zYWwxMDk=',
        },
        'internal_analyst',
      ),
    ).resolves.toMatchSnapshot()
  })

  it("does not fetches proposal's related analysts when authenticated as user.", async () => {
    await expect(
      graphql(
        ProposalAnalystsQuery,
        {
          id: 'UHJvcG9zYWw6cHJvcG9zYWwxMDk=',
        },
        'internal_user',
      ),
    ).resolves.toMatchSnapshot()
  })
})
