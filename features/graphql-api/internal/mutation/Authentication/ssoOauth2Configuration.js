/* eslint-env jest */
import '../../../_setup'

const CreateOauth2SSOConfiguration = /* GraphQL */ `
  mutation CreateOauth2SSOConfigurationMutation($input: CreateOauth2SSOConfigurationInput!) {
    createOauth2SSOConfiguration(input: $input) {
      ssoConfiguration {
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
      }
    }
  }
`

const UpdateOauth2SSOConfiguration = /* GraphQL */ `
  mutation UpdateOauth2SSOConfigurationMutation($input: UpdateOauth2SSOConfigurationInput!) {
    updateOauth2SSOConfiguration(input: $input) {
      ssoConfiguration {
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
      }
    }
  }
`

const DeleteSSOConfiguration = /* GraphQL */ `
  mutation DeleteSSOConfigurationMutation($input: DeleteSSOConfigurationInput!) {
    deleteSSOConfiguration(input: $input) {
      deletedSsoConfigurationId
    }
  }
`

const fixtureId = global.toGlobalId('Oauth2SSOConfiguration', 'ssoOauth2')

describe('Internal|SSO|Oauth2', () => {
  let createdId

  it('Creates a config as super admin', async () => {
    const creationResult = await graphql(
      CreateOauth2SSOConfiguration,
      {
        input: {
          name: 'Test SSO',
          enabled: true,
          disconnectSsoOnLogout: true,
          clientId: 'test',
          secret: 'test',
          authorizationUrl: 'https://test.dev/auth',
          accessTokenUrl: 'https://test.dev/token',
          userInfoUrl: 'https://test.dev/userinfo',
          logoutUrl: 'https://test.dev/logout',
          profileUrl: 'https://test.dev/account',
        },
      },
      'internal_super_admin',
    )

    expect(creationResult).toMatchSnapshot({
      createOauth2SSOConfiguration: {
        ssoConfiguration: {
          id: expect.any(String),
          redirectUri: expect.any(String),
        },
      },
    })

    createdId = creationResult.createOauth2SSOConfiguration.ssoConfiguration.id
  })

  it('Deletes a config as admin only', async () => {
    await expect(
      graphql(
        DeleteSSOConfiguration,
        {
          input: {
            id: createdId,
          },
        },
        'internal_admin',
      ),
    ).resolves.toMatchSnapshot({
      deleteSSOConfiguration: {
        deletedSsoConfigurationId: expect.any(String),
      },
    })
  })

  it('Updates a config as super admin', async () => {
    await expect(
      graphql(
        UpdateOauth2SSOConfiguration,
        {
          input: {
            id: fixtureId,
            name: 'Cap collectif Oauth2 Provider',
            enabled: true,
            disconnectSsoOnLogout: true,
            clientId: 'account',
            secret: 'INSERT_A_REAL_SECRET',
            authorizationUrl: 'INSERT_A_REAL_SECRET',
            accessTokenUrl: 'INSERT_A_REAL_SECRET',
            userInfoUrl: 'INSERT_A_REAL_SECRET',
            logoutUrl: 'INSERT_A_REAL_SECRET',
            profileUrl: 'INSERT_A_REAL_SECRET',
          },
        },
        'internal_super_admin',
      ),
    ).resolves.toMatchSnapshot({
      updateOauth2SSOConfiguration: {
        ssoConfiguration: {
          redirectUri: expect.any(String),
        },
      },
    })
  })

  it('Tries to create a config as admin only', async () => {
    await expect(
      graphql(
        CreateOauth2SSOConfiguration,
        {
          input: {
            name: 'Test SSO',
            enabled: true,
            disconnectSsoOnLogout: true,
            clientId: 'test',
            secret: 'test',
            authorizationUrl: 'https://test.dev/auth',
            accessTokenUrl: 'https://test.dev/token',
            userInfoUrl: 'https://test.dev/userinfo',
            logoutUrl: 'https://test.dev/logout',
            profileUrl: 'https://test.dev/account',
          },
        },
        'internal_admin',
      ),
    ).rejects.toThrowError('Access denied to this field.')
  })

  it('Tries to update a config as admin only', async () => {
    await expect(
      graphql(
        UpdateOauth2SSOConfiguration,
        {
          input: {
            id: fixtureId,
            name: 'Cap collectif Oauth2 Provider',
            enabled: true,
            disconnectSsoOnLogout: true,
            clientId: 'account',
            secret: 'INSERT_A_REAL_SECRET',
            authorizationUrl: 'INSERT_A_REAL_SECRET',
            accessTokenUrl: 'INSERT_A_REAL_SECRET',
            userInfoUrl: 'INSERT_A_REAL_SECRET',
            logoutUrl: 'INSERT_A_REAL_SECRET',
            profileUrl: 'INSERT_A_REAL_SECRET',
          },
        },
        'internal_admin',
      ),
    ).rejects.toThrowError('Access denied to this field.')
  })
})
