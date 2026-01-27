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
