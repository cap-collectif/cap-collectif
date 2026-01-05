/* eslint-env jest */
import '../../../../_setup'
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
