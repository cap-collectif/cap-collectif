/*eslint-env jest */
import '../../../_setupDB'

const duplicateProposalFormMutation = /* GraphQl */ `
  mutation DuplicateProposalForm($input: DuplicateProposalFormInput!) {
    duplicateProposalForm(input: $input) {
      duplicatedProposalForm {
        title
        owner {
          username
        }
      }
    }
  }
`

describe('Internal | duplicateProposalForm', () => {
  /**
   * @jest-status compliant
   * @jest-reason Checks an awaited explicit refusal from the real GraphQL API with controlled request inputs
   * and identity.
   */
  it('cannot duplicate if not owner', async () => {
    await expect(
      graphql(
        duplicateProposalFormMutation,
        {
          input: {
            id: 'proposalForm1',
          },
        },
        'internal_theo',
      ),
    ).rejects.toThrowError('Access denied to this field.')
  })
  /**
   * @jest-status non-compliant
   * @jest-reason Checks only a GraphQL response snapshot; add explicit assertions for the API contract.
   */
  it('duplicate own proposalForm', async () => {
    const response = await graphql(
      duplicateProposalFormMutation,
      {
        input: {
          id: 'proposalFormWithOwner',
        },
      },
      'internal_theo',
    )
    expect(response).toMatchSnapshot()
  })
  /**
   * @jest-status non-compliant
   * @jest-reason Checks only a GraphQL response snapshot; add explicit assertions for the API contract.
   */
  it('duplicate someone else proposalForm as admin', async () => {
    const response = await graphql(
      duplicateProposalFormMutation,
      {
        input: {
          id: 'proposalForm2',
        },
      },
      'internal_admin',
    )
    expect(response).toMatchSnapshot()
  })
})
