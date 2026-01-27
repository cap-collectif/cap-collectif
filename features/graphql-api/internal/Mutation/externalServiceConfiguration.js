/* eslint-env jest */
import '../../_setupDB'

const ExternalServiceConfigurationMutation = /* GraphQL */ `
  mutation ($input: UpdateExternalServiceConfigurationInput!) {
    updateExternalServiceConfiguration(input: $input) {
      externalServiceConfiguration {
        value
      }
      error
    }
  }
`
describe('Internal|ExternalServiceConfiguration', () => {
  it('Admin wants to update configuration but provides invalid value', async () => {
    await expect(
      graphql(
        ExternalServiceConfigurationMutation,
        {
          input: {
            type: 'MAILER',
            value: 'invalid',
          },
        },
        'internal_admin',
      ),
    ).resolves.toMatchSnapshot()
  })

  it('Admin updates configuration', async () => {
    await expect(
      graphql(
        ExternalServiceConfigurationMutation,
        {
          input: {
            type: 'MAILER',
            value: 'mailjet',
          },
        },
        'internal_admin',
      ),
    ).resolves.toMatchSnapshot()
  })
})
