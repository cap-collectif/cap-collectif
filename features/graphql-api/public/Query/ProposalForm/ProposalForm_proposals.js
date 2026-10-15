/* eslint-env jest */
import '../../../_setupESOnce'

const InternalQuery = /* GraphQL */ `
  query InternalQuery($proposalForm: ID!) {
    proposalForm: node(id: $proposalForm) {
      ... on ProposalForm {
        proposals(first: 10, orderBy: { field: COMMENTS, direction: DESC }) {
          edges {
            node {
              id
              comments {
                totalCount
              }
              createdAt
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
describe('Internal|ProposalForm.proposals', () => {
  it('fetches proposals ordered by biggest number of comments', async () => {
    await expect(
      graphql(
        InternalQuery,
        {
          proposalForm: 'proposalform1',
        },
        'internal',
      ),
    ).resolves.toMatchSnapshot()
  })
})
