/*eslint-env jest */
import '../../../_setupDB'

const mutation = /* GraphQL */ `
  mutation DeleteProposalForm($input: DeleteProposalFormInput!) {
    deleteProposalForm(input: $input) {
      deletedProposalFormId
    }
  }
`

describe('Internal | deleteProposalForm', () => {
  /**
   * @jest-status compliant
   * @jest-reason Checks an awaited explicit refusal from the real GraphQL API with controlled request inputs
   * and identity.
   */
  it('cannot delete non existing ProposalForm', async () => {
    await expect(
      graphql(
        mutation,
        {
          input: {
            id: 'proposalFormNone',
          },
        },
        'internal_admin',
      ),
    ).rejects.toThrowError('NOT_FOUND')
  })
  /**
   * @jest-status compliant
   * @jest-reason Checks an awaited explicit refusal from the real GraphQL API with controlled request inputs
   * and identity.
   */
  it('cannot delete someone else ProposalForm', async () => {
    await expect(
      graphql(
        mutation,
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
  it('delete own ProposalForm', async () => {
    const response = await graphql(
      mutation,
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
  it('cannot delete someone else ProposalForm if admin', async () => {
    const response = await graphql(
      mutation,
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
