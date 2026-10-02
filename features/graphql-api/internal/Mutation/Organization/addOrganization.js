/* eslint-env jest */
import '../../../_setupDB'

const AddOrganization = /* GraphQL*/ `
  mutation AddOrganization($input: AddOrganizationInput!) {
    addOrganization(input: $input) {
      organization {
        title 
        body
      }
    }
  }
`

const input = {
  translations: [
    {
      title: 'Titre organization',
      body: 'Description',
      locale: 'FR_FR',
    },
  ],
}

describe('mutations.addOrganization', () => {
  /**
   * @jest-status non-compliant
   * @jest-reason Checks only a GraphQL response snapshot; add explicit assertions for the API contract.
   */
  it('admin should be able to add organization', async () => {
    const response = await graphql(
      AddOrganization,
      {
        input,
      },
      'internal_admin',
    )
    expect(response).toMatchSnapshot()
  })
  /**
   * @jest-status compliant
   * @jest-reason Checks an awaited explicit refusal from the real GraphQL API with controlled request inputs
   * and identity.
   */
  it('admin organization should not be able to add organization', async () => {
    await expect(graphql(AddOrganization, { input }, 'internal_valerie')).rejects.toThrowError(
      'Access denied to this field.',
    )
  })
  /**
   * @jest-status compliant
   * @jest-reason Checks an awaited explicit refusal from the real GraphQL API with controlled request inputs
   * and identity.
   */
  it('organization member with role user should not be able to add organization', async () => {
    await expect(graphql(AddOrganization, { input }, 'internal_user')).rejects.toThrowError(
      'Access denied to this field.',
    )
  })
})
