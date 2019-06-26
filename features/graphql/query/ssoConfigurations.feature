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
              "name": "Oauth2 Provider",
              "enabled": true,
              "clientId": "clientId",
              "secret": "SecretKey",
              "authorizationUrl": "https://localhost:8888/authorization",
              "accessTokenUrl": "https://localhost:8888/token",
              "userInfoUrl": "https://localhost:8888/user",
              "logoutUrl": "https://localhost:8888/logout"
            }
          }
        ]
      }
    }
  }
  """
