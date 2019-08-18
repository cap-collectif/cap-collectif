@updateOauth2SSOConfiguration
Feature: Update Oauth2 SSO Configuration

@database
Scenario: Admin wants to update a Oauth2 SSO configuration
  Given I am logged in to graphql as super admin
  And I send a GraphQL POST request:
   """
   {
    "query": "mutation ($input: InternalUpdateOauth2SSOConfigurationInput!) {
      updateOauth2SSOConfiguration(input: $input) {
        ssoConfiguration {
          name
          enabled
          clientId
          secret
          authorizationUrl
          accessTokenUrl
          userInfoUrl
          logoutUrl
          profileUrl
          buttonColor
          labelColor
        }
      }
    }",
    "variables": {
      "input": {
        "id": "T2F1dGgyU1NPQ29uZmlndXJhdGlvbjpzc29PYXV0aDI=",
        "name": "Cap collectif Oauth2 Provider",
        "enabled": true,
        "clientId": "account",
        "secret": "***REMOVED***",
        "authorizationUrl": "https://keycloak.cap-collectif.com/auth/realms/master/protocol/openid-connect/auth",
        "accessTokenUrl": "https://keycloak.cap-collectif.com/auth/realms/master/protocol/openid-connect/token",
        "userInfoUrl": "https://keycloak.cap-collectif.com/auth/realms/master/protocol/openid-connect/userinfo",
        "logoutUrl": "https://keycloak.cap-collectif.com/auth/realms/master/protocol/openid-connect/logout",
        "profileUrl": "https://keycloak.cap-collectif.com/auth/realms/master/account",
        "buttonColor": "#CDCDCD",
        "labelColor": "#000000"
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
          "clientId": "account",
          "secret": "***REMOVED***",
          "authorizationUrl": "https://keycloak.cap-collectif.com/auth/realms/master/protocol/openid-connect/auth",
          "accessTokenUrl": "https://keycloak.cap-collectif.com/auth/realms/master/protocol/openid-connect/token",
          "userInfoUrl": "https://keycloak.cap-collectif.com/auth/realms/master/protocol/openid-connect/userinfo",
          "logoutUrl": "https://keycloak.cap-collectif.com/auth/realms/master/protocol/openid-connect/logout",
          "profileUrl": "https://keycloak.cap-collectif.com/auth/realms/master/account",
          "buttonColor": "#CDCDCD",
          "labelColor": "#000000"
         }
       }
     }
  }
  """
