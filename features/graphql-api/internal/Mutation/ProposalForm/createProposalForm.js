/*eslint-env jest */
import '../../../_setupDB'

const mutation = /* GraphQL */ `
  mutation CreateProposalForm($input: CreateProposalFormInput!) {
    createProposalForm(input: $input) {
      proposalForm {
        title
        allowAknowledge
        owner {
          username
        }
      }
    }
  }
`

describe('Internal | createProposalForm', () => {
  it('create proposalForm', async () => {
    const response = await graphql(
      mutation,
      {
        input: {
          title: 'Bonjour !',
        },
      },
      'internal_theo',
    )
    expect(response).toMatchSnapshot()
  })
})
