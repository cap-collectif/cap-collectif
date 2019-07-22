@ssoConfigurations
Feature: SSO configurations

Scenario: GraphQL admin client wants to get all SSO Configurations
  Given I am logged in to graphql as admin
  And I send a GraphQL POST request:
  """
  {
    "query": "{
      ssoConfigurations {
        totalCount
        edges {
          node {
            id
            name
            enabled
            profileUrl
            ... on Oauth2SSOConfiguration {
              clientId
              secret
              authorizationUrl
              accessTokenUrl
              userInfoUrl
              logoutUrl
            }
          }
        }
      }
    }"
  }
  """
  Then the JSON response should match:
  """
  {
    "data":
    {
      "ssoConfigurations": {
        "totalCount": 1,
        "edges": [
          {
            "node": {
              "id": "RXZlbnQ6c3NvT2F1dGgy",
              "name": "Cap collectif Oauth2 Provider",
              "enabled": true,
              "clientId": "account",
              "secret": "***REMOVED***",
              "authorizationUrl": "https://keycloak.cap-collectif.com/auth/realms/master/protocol/openid-connect/auth",
              "accessTokenUrl": "https://keycloak.cap-collectif.com/auth/realms/master/protocol/openid-connect/token",
              "userInfoUrl": "https://keycloak.cap-collectif.com/auth/realms/master/protocol/openid-connect/userinfo",
              "logoutUrl": "https://keycloak.cap-collectif.com/auth/realms/master/protocol/openid-connect/logout",
              "profileUrl": "https://keycloak.cap-collectif.com/auth/realms/master/account"
            }
          }
        ]
      }
    }
  }
  """
