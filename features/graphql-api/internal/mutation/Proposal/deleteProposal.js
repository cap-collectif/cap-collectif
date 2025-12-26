/* eslint-env jest */
import '../../../resetDatabaseBeforeEach'

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
  it('Anonymous GraphQL client can not delete a proposal', async () => {
    await expect(
      graphql(
        deleteProposalMutation,
        {
          input: {
            proposalId: 'UHJvcG9zYWw6cHJvcG9zYWwx2',
          },
        },
        'internal',
      ),
    ).rejects.toThrowError('Access denied to this field.')
  })

  it('User GraphQL client can delete his proposal', async () => {
    await global.enableFeatureFlag('themes')
    await global.enableFeatureFlag('districts')

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
})
