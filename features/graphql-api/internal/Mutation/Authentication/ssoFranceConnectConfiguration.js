/* eslint-env jest */
import '../../../_setup'

const UpdateFranceConnectSSOConfiguration = /* GraphQL */ `
  mutation ($input: UpdateFranceConnectSSOConfigurationInput!) {
    updateFranceConnectSSOConfiguration(input: $input) {
      fcConfiguration {
        id
        name
        enabled
        clientId
        secret
        authorizationUrl
        accessTokenUrl
        userInfoUrl
        logoutUrl
        redirectUri
        environment
      }
    }
  }
`

const testingConfig = {
  input: {
    birthcountry: false,
    birthdate: true,
    birthplace: false,
    clientId: 'account',
    email: true,
    enabled: true,
    environment: 'TESTING',
    family_name: true,
    gender: true,
    given_name: true,
    preferred_username: false,
    secret: 'INSERT_A_REAL_SECRET',
  },
}

const productionConfig = {
  input: {
    birthcountry: false,
    birthdate: true,
    birthplace: false,
    clientId: 'account',
    email: true,
    enabled: true,
    environment: 'PRODUCTION',
    family_name: true,
    gender: true,
    given_name: true,
    preferred_username: false,
    secret: 'INSERT_A_REAL_SECRET',
  },
}

describe('Internal|SSO|FranceConnect', () => {
  it('Updates a config as super admin', async () => {
    await expect(
      graphql(UpdateFranceConnectSSOConfiguration, testingConfig, 'internal_super_admin'),
    ).resolves.toMatchSnapshot({
      updateFranceConnectSSOConfiguration: {
        fcConfiguration: {
          redirectUri: expect.any(String),
        },
      },
    })
  })

  it('Updates a config and turn it to production as super admin', async () => {
    await expect(
      graphql(UpdateFranceConnectSSOConfiguration, productionConfig, 'internal_super_admin'),
    ).resolves.toMatchSnapshot({
      updateFranceConnectSSOConfiguration: {
        fcConfiguration: {
          redirectUri: expect.any(String),
        },
      },
    })
  })

  it('Tries to update the configuration as admin only', async () => {
    await expect(graphql(UpdateFranceConnectSSOConfiguration, testingConfig, 'internal_admin')).rejects.toThrowError(
      'Access denied to this field.',
    )
  })
})
