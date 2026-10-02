/* eslint-env jest */
import '../../../_setupDB'

const UpdateProposalFusionMutation = /* GraphQL*/ `
    mutation ($input: UpdateProposalFusionInput!) {
      updateProposalFusion (input: $input) {
        proposal {
          id
          mergedFrom {
            id
          }
        }
        removedMergedFrom {
          id
        }
      }
    }
`

/**
 * @jest-status non-compliant
 * @jest-reason Checks only a GraphQL response snapshot; add explicit assertions for the API contract.
 */
describe('mutations.updateProposalFusionMutation', () => {
  it('GraphQL admin wants to update a fusion', async () => {
    await expect(
      graphql(
        UpdateProposalFusionMutation,
        {
          input: {
            proposalId: 'UHJvcG9zYWw6cHJvcG9zYWwx',
            fromProposals: ['UHJvcG9zYWw6cHJvcG9zYWwy', 'UHJvcG9zYWw6cHJvcG9zYWwz'],
          },
        },
        'internal_admin',
      ),
    ).resolves.toMatchSnapshot()

    await expect(
      graphql(
        UpdateProposalFusionMutation,
        {
          input: {
            proposalId: 'UHJvcG9zYWw6cHJvcG9zYWwx',
            fromProposals: ['UHJvcG9zYWw6cHJvcG9zYWwz', 'UHJvcG9zYWw6cHJvcG9zYWw0'],
          },
        },
        'internal_admin',
      ),
    ).resolves.toMatchSnapshot()
  })
})
