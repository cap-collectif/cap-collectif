/* eslint-env jest */
import '../../../_setupDB'

const UpdateFacebookSSOConfiguration = /* GraphQL */ `
  mutation UpdateFacebookSSOConfigurationMutation($input: UpdateFacebookSSOConfigurationInput!) {
    updateFacebookSSOConfiguration(input: $input) {
      facebookSSOConfiguration {
        id
        name
        enabled
        clientId
        secret
      }
    }
  }
`

const input = {
  input: {
    clientId: '123',
    secret: '53cr37',
    enabled: false,
  },
}

describe('Internal|SSO|Facebook', () => {
  it('Updates a config as super admin', async () => {
    await expect(graphql(UpdateFacebookSSOConfiguration, input, 'internal_super_admin')).resolves.toMatchSnapshot()
  })

  it('Tries to update a config as admin', async () => {
    await expect(graphql(UpdateFacebookSSOConfiguration, input, 'internal_admin')).rejects.toThrowError(
      'Access denied to this field.',
    )
  })
})
