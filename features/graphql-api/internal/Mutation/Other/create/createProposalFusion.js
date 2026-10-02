/* eslint-env jest */
import '../../../../_setupDB'
const createProposalFusionQuery = /* GraphQL */ `
  mutation ($input: CreateProposalFusionInput!) {
    createProposalFusion(input: $input) {
      proposal {
        author {
          id
        }
        title
        adminUrl
        mergedFrom {
          id
        }
      }
    }
  }
`

describe('Internal|Proposal fusion', () => {
  /**
   * @jest-status non-compliant
   * @jest-reason Checks only a GraphQL response snapshot; add explicit assertions for the API contract.
   */
  it('GraphQL admin wants to create a fusion', async () => {
    await expect(
      graphql(
        createProposalFusionQuery,
        {
          input: {
            fromProposals: ['UHJvcG9zYWw6cHJvcG9zYWwx', 'UHJvcG9zYWw6cHJvcG9zYWwy'],
            title: 'Test fusion',
          },
        },
        'internal_admin',
      ),
    ).resolves.toMatchSnapshot({
      createProposalFusion: {
        proposal: {
          adminUrl: expect.any(String),
        },
      },
    })
  })

  /**
   * @jest-status compliant
   * @jest-reason Checks an awaited explicit refusal from the real GraphQL API with controlled request inputs
   * and identity.
   */
  it('GraphQL admin wants to create a fusion with only 1 proposal', async () => {
    await expect(
      graphql(
        createProposalFusionQuery,
        {
          input: {
            fromProposals: ['UHJvcG9zYWw6cHJvcG9zYWwx'],
            title: 'Test fusion',
          },
        },
        'internal_admin',
      ),
    ).rejects.toThrowError('You must specify at least 2 proposals to merge')
  })

  /**
   * @jest-status compliant
   * @jest-reason Checks an awaited explicit refusal from the real GraphQL API with controlled request inputs
   * and identity.
   */
  it('GraphQL admin wants to create a fusion with proposals from different forms', async () => {
    await expect(
      graphql(
        createProposalFusionQuery,
        {
          input: {
            fromProposals: ['UHJvcG9zYWw6cHJvcG9zYWwx', 'UHJvcG9zYWw6cHJvcG9zYWw4'],
            title: 'Test fusion',
          },
        },
        'internal_admin',
      ),
    ).rejects.toThrowError('All proposals to merge should have the same proposalForm.')
  })
})
