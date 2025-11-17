/* eslint-env jest */
import '../../../_setup'

beforeEach(async () => {
  await global.enableFeatureFlag('emailing')
})

const CreateSenderEmailMutation = /* GraphQL*/ `
    mutation ($input: CreateSenderEmailInput!) {
      createSenderEmail(input: $input) {
        senderEmail {
          locale
          domain
          address
          isDefault
        }
        errorCode
      }
    }
`

describe('mutations.createSenderEmail', () => {
  it('Admin tries to add a SenderEmail without adding domain first', async () => {
    await expect(
      graphql(
        CreateSenderEmailMutation,
        {
          input: {
            locale: 'dev',
            domain: 'cap-individuel.com',
          },
        },
        'internal_admin',
      ),
    ).resolves.toMatchSnapshot()
  })

  it('Admin tries to add an already existing SenderEmail', async () => {
    await expect(
      graphql(
        CreateSenderEmailMutation,
        {
          input: {
            locale: 'dev',
            domain: 'cap-collectif.com',
          },
        },
        'internal_admin',
      ),
    ).resolves.toMatchSnapshot()
  })

  it('Admin adds a new SenderEmail', async () => {
    await expect(
      graphql(
        CreateSenderEmailMutation,
        {
          input: {
            locale: 'juan',
            domain: 'cap-collectif.com',
          },
        },
        'internal_admin',
      ),
    ).resolves.toMatchSnapshot()
  })
})
