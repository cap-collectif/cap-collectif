@updateOauth2SSOConfiguration @admin
Feature: Update Oauth2 SSO Configuration

@database
Scenario:
Admin wants to update a Oauth2 SSO configuration
  Given I am logged in to graphql as super admin
  And I send a GraphQL POST request:
   """
   {
    "query": "mutation ($input: UpdateOauth2SSOConfigurationInput!) {
      updateOauth2SSOConfiguration(input: $input) {
        ssoConfiguration {
          name
          enabled
          disconnectSsoOnLogout
          clientId
          secret
          authorizationUrl
          accessTokenUrl
          userInfoUrl
          logoutUrl
          profileUrl
        }
      }
    }",
    "variables": {
      "input": {
        "id": "T2F1dGgyU1NPQ29uZmlndXJhdGlvbjpzc29PYXV0aDI=",
        "name": "Cap collectif Oauth2 Provider",
        "enabled": true,
        "disconnectSsoOnLogout": true,
        "clientId": "account",
        "secret": "INSERT_A_REAL_SECRET",
        "authorizationUrl": "INSERT_A_REAL_SECRET",
        "accessTokenUrl": "INSERT_A_REAL_SECRET",
        "userInfoUrl": "INSERT_A_REAL_SECRET",
        "logoutUrl": "INSERT_A_REAL_SECRET",
        "profileUrl": "INSERT_A_REAL_SECRET"
      }
    }
  }
  """
  Then the JSON response should match:
  """
  {
    "data": {
      "updateOauth2SSOConfiguration": {
        "ssoConfiguration": {
          "name": "Cap collectif Oauth2 Provider",
          "enabled": true,
          "disconnectSsoOnLogout": true,
          "clientId": "account",
          "secret": "INSERT_A_REAL_SECRET",
          "authorizationUrl": @string@,
          "accessTokenUrl": @string@,
          "userInfoUrl": @string@,
          "logoutUrl": @string@,
          "profileUrl": @string@
         }
       }
     }
  }
  """
