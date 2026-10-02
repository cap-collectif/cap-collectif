/* eslint-env jest */
import '../../../_setupDB'

const deleteProposalMutation = /* GraphQL */ `
  mutation ($input: DeleteProposalInput!) {
    deleteProposal(input: $input) {
      proposal {
        id
        deletedAt
        publicationStatus
      }
    }
  }
`

describe('Internal|delete proposal', () => {
  /**
   * @jest-status non-compliant
   * @jest-reason Checks only a GraphQL response snapshot; add explicit assertions for the API contract.
   */
  it('User GraphQL client can delete his proposal', async () => {
    await expect(
      graphql(
        deleteProposalMutation,
        {
          input: {
            proposalId: 'UHJvcG9zYWw6cHJvcG9zYWwxMg==',
          },
        },
        'internal_user',
      ),
    ).resolves.toMatchSnapshot({
      deleteProposal: {
        proposal: {
          deletedAt: expect.any(String),
          id: expect.any(String),
        },
      },
    })
  })

  /**
   * @jest-status non-compliant
   * @jest-reason Checks only a GraphQL response snapshot; add explicit assertions for the API contract.
   */
  it('GraphQL client wants delete a proposal', async () => {
    await expect(
      graphql(
        deleteProposalMutation,
        {
          input: {
            proposalId: 'UHJvcG9zYWw6cHJvcG9zYWw4',
          },
        },
        'internal_super_admin',
      ),
    ).resolves.toMatchSnapshot({
      deleteProposal: {
        proposal: {
          deletedAt: expect.any(String),
          id: expect.any(String),
        },
      },
    })
  })

  /**
   * @jest-status compliant
   * @jest-reason Checks an awaited explicit refusal from the real GraphQL API with controlled request inputs
   * and identity.
   */
  it('Anonymous GraphQL client can not delete a proposal', async () => {
    await expect(
      graphql(
        deleteProposalMutation,
        {
          input: {
            proposalId: 'UHJvcG9zYWw6cHJvcG9zYWwx',
          },
        },
        'internal',
      ),
    ).rejects.toThrowError("Can't delete proposal")
  })
})
