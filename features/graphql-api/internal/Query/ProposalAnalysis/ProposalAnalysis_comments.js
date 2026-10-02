const ProposalAnalysisComments = /** GraphQL */ `
  query ProposalAnalysisComments($id: ID!) {
    node(id: $id) {
      ... on Proposal {
        analyses {
          id
          state
          analyst {
            username
          }
          comments {
            totalCount
            edges {
              node {
                id
                body
                createdAt
                author {
                  username
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
describe('ProposalAnalysis.comments', () => {
  it('should fetch analysis comments', async () => {
    await expect(
      graphql(
        ProposalAnalysisComments,
        {
          id: 'UHJvcG9zYWw6cHJvcG9zYWwxMDk=',
        },
        'internal_supervisor',
      ),
    ).resolves.toMatchSnapshot()
  })
})
