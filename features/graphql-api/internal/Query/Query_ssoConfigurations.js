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
        }
      }
    }
  }
`;

describe('Internal|Query.ssoConfigurations', () => {
  it('fetches all configurations', async () => {
    await expect(graphql(InternalQuery, {}, 'internal_admin')).resolves.toMatchSnapshot({
      ssoConfigurations: {
        edges: [
          {
            node: {
              clientId: expect.any(String),
              secret: expect.any(String),
            },
          },
          {
            node: {
              clientId: expect.any(String),
              secret: expect.any(String),
            },
          },
          {
            node: {
              clientId: expect.any(String),
              secret: expect.any(String),
              authorizationUrl: expect.any(String),
              accessTokenUrl: expect.any(String),
              userInfoUrl: expect.any(String),
              logoutUrl: expect.any(String),
            },
          },
        ],
      },
    });
  });
});
