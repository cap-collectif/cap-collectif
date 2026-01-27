/* eslint-env jest */
import '../../_setupDB'

const CreateProposalFusionMutation = /* GraphQL*/ `
  mutation CreateProposalFusionMutation(
    $input: CreateProposalFusionInput!
  ) {
    createProposalFusion(input: $input) {
      proposal {
        title
      }
    }
  }
`

describe('mutations.createProposalFusion', () => {
  // admin
  it('admin should merge proposals.', async () => {
    const createProposalFusionMutation = await graphql(
      CreateProposalFusionMutation,
      {
        input: {
          fromProposals: ['UHJvcG9zYWw6cHJvcG9zYWw3', 'UHJvcG9zYWw6cHJvcG9zYWw5'],
          title: 'Titre de fusion',
          description: '<p>test</p>',
        },
      },
      'internal_admin',
    )
    expect(createProposalFusionMutation).toMatchSnapshot()
  })
})
