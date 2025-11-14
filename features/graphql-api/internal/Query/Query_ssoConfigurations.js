/* eslint-env jest */
const InternalQuery = /* GraphQL */ `
  query GetAllSSOConfigurationQuery {
    ssoConfigurations {
      totalCount
      edges {
        node {
          id
          name
          enabled
          ... on Oauth2SSOConfiguration {
            clientId
            secret
            authorizationUrl
            accessTokenUrl
            userInfoUrl
            logoutUrl
            redirectUri
          }
          ... on FranceConnectSSOConfiguration {
            clientId
            secret
            authorizationUrl
            accessTokenUrl
            userInfoUrl
            logoutUrl
            redirectUri
            environment
          }
          ... on FacebookSSOConfiguration {
            clientId
            secret
          }
          ... on CASSSOConfiguration {
            casVersion
            casCertificate
            casServerUrl
          }
        }
      }
    }
  }
`

describe('Internal|Query.ssoConfigurations', () => {
  it('fetches all configurations', async () => {
    await expect(graphql(InternalQuery, {}, 'internal_admin')).resolves.toMatchSnapshot({
      ssoConfigurations: {
        edges: [
          {
            node: {
              casVersion: expect.any(String),
              casCertificate: expect.any(String),
              casServerUrl: expect.any(String),
              name: 'CAS',
            },
          },
          {
            node: {
              clientId: expect.any(String),
              secret: expect.any(String),
              name: 'Facebook',
            },
          },
          {
            node: {
              clientId: expect.any(String),
              secret: expect.any(String),
              redirectUri: expect.any(String),
              name: 'France Connect',
            },
          },
          {
            node: {
              clientId: expect.any(String),
              secret: expect.any(String),
              authorizationUrl: expect.any(String),
              accessTokenUrl: expect.any(String),
              userInfoUrl: expect.any(String),
              redirectUri: expect.any(String),
              logoutUrl: expect.any(String),
              name: 'Oauth2',
            },
          },
        ],
      },
    })
  })
})
