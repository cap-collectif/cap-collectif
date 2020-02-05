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
            buttonColor
            labelColor
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
          }
        }
      }
    }"
  }
  """
  Then the JSON response should match:
  """
  {
     "data":{
        "ssoConfigurations":{
           "totalCount": 2,
           "edges":[
              {
                 "node":{
                    "id":"RnJhbmNlQ29ubmVjdFNTT0NvbmZpZ3VyYXRpb246ZnJhbmNlQ29ubmVjdA==",
                    "name":"France Connect",
                    "enabled":true,
                    "profileUrl":null,
                    "buttonColor":"#7498c0",
                    "labelColor":"#FFFFFF",
                    "clientId":"***REMOVED***",
                    "secret":"***REMOVED***",
                    "authorizationUrl":"https://fcp.integ01.dev-franceconnect.fr/api/v1/authorize",
                    "accessTokenUrl":"https://fcp.integ01.dev-franceconnect.fr/api/v1/token",
                    "userInfoUrl":"https://fcp.integ01.dev-franceconnect.fr/api/v1/userinfo",
                    "logoutUrl":"https://fcp.integ01.dev-franceconnect.fr/api/v1/logout",
                    "redirectUri":"https://capco.test/login/check-franceconnect",
                    "environment":"TESTING"
                 }
              },
              {
                 "node":{
                    "id":"T2F1dGgyU1NPQ29uZmlndXJhdGlvbjpzc29PYXV0aDI=",
                    "name":"Cap collectif Oauth2 Provider",
                    "enabled":false,
                    "profileUrl":"https://keycloak.cap-collectif.com/auth/realms/master/account",
                    "buttonColor":"#7498c0",
                    "labelColor":"#FFFFFF",
                    "clientId":"account",
                    "secret":"***REMOVED***",
                    "authorizationUrl":"https://keycloak.cap-collectif.com/auth/realms/master/protocol/openid-connect/auth",
                    "accessTokenUrl":"https://keycloak.cap-collectif.com/auth/realms/master/protocol/openid-connect/token",
                    "userInfoUrl":"https://keycloak.cap-collectif.com/auth/realms/master/protocol/openid-connect/userinfo",
                    "logoutUrl":"https://keycloak.cap-collectif.com/auth/realms/master/protocol/openid-connect/logout",
                    "redirectUri":"https://capco.test/login/check-openid"
                 }
              }
           ]
        }
     }
  }
  """
