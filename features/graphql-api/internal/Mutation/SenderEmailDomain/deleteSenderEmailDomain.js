/* eslint-env jest */
import '../../../_setupDB'

const DeleteSenderEmailDomainMutation = /* GraphQL*/ `
    mutation ($input: DeleteSenderEmailDomainInput!) {
      deleteSenderEmailDomain(input: $input) {
        deletedId
        errorCode
      }
    }
`

describe('mutations.deleteSenderEmailDomain', () => {
  it('Admin tries to delete an used SenderEmailDomain', async () => {
    await expect(
      graphql(
        DeleteSenderEmailDomainMutation,
        {
          input: {
            id: 'mailjetCapco',
          },
        },
        'internal_admin',
      ),
    ).resolves.toMatchSnapshot()
  })

  it('Admin deletes a SenderEmailDomain', async () => {
    await expect(
      graphql(
        DeleteSenderEmailDomainMutation,
        {
          input: {
            id: 'mailjetElysee',
          },
        },
        'internal_admin',
      ),
    ).resolves.toMatchSnapshot()
  })
})
