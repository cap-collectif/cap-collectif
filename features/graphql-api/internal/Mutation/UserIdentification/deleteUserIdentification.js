/* eslint-env jest */
import '../../../_setupDB'

const deleteUserIdentificationMutation = /* GraphQL*/ `
  mutation ($input: DeleteUserIdentificationCodeListInput!) {
    deleteUserIdentificationCodeList(input: $input) {
      deletedUserIdentificationCodeListId
      errorCode
    }
  }
`

describe('mutations.deleteUserIdentification', () => {
  /**
   * @jest-status compliant
   * @jest-reason Checks an awaited explicit refusal from the real GraphQL API with controlled request inputs
   * and identity.
   */
  it('API client wants to delete a list but is not admin', async () => {
    await expect(
      graphql(
        deleteUserIdentificationMutation,
        {
          input: {
            id: 'VXNlcklkZW50aWZpY2F0aW9uQ29kZUxpc3Q6bmV3TGlzdA==',
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
  it('API admin wants to delete a list but wrong id', async () => {
    await expect(
      graphql(
        deleteUserIdentificationMutation,
        {
          input: {
            id: 'test',
          },
        },
        'internal_admin',
      ),
    ).resolves.toMatchSnapshot()
  })

  /**
   * @jest-status non-compliant
   * @jest-reason Checks only a GraphQL response snapshot; add explicit assertions for the API contract.
   */
  it('API admin wants to delete a list', async () => {
    await expect(
      graphql(
        deleteUserIdentificationMutation,
        {
          input: {
            id: 'VXNlcklkZW50aWZpY2F0aW9uQ29kZUxpc3Q6bmV3TGlzdA==',
          },
        },
        'internal_admin',
      ),
    ).resolves.toMatchSnapshot()
  })
})
