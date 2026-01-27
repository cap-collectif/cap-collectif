/* eslint-env jest */
import '../../../_setupDB'

const CreateSenderEmailDomainMutation = /* GraphQL*/ `
    mutation ($input: CreateSenderEmailDomainInput!) {
      createSenderEmailDomain(input: $input) {
        errorCode
        senderEmailDomain {
          service
          value
          spfValidation
          dkimValidation
        }
      }
    }
`

describe('mutations.createSenderEmailDomain', () => {
  it('Admin wants to add a new SenderEmailDomain but already exists', async () => {
    await expect(
      graphql(
        CreateSenderEmailDomainMutation,
        {
          input: {
            service: 'MANDRILL',
            value: 'cap-collectif.com',
          },
        },
        'internal_admin',
      ),
    ).resolves.toMatchSnapshot()
  })

  it('Admin adds a new SenderEmailDomain', async () => {
    await expect(
      graphql(
        CreateSenderEmailDomainMutation,
        {
          input: {
            service: 'MANDRILL',
            value: 'cap-individuel.com',
          },
        },
        'internal_admin',
      ),
    ).resolves.toMatchSnapshot()
  })
})
