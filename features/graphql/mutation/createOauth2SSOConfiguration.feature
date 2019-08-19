@createOauth2SSOConfiguration
Feature: Create Oauth2 SSO Configuration

@database
Scenario: Admin wants to create an Oauth2 SSO configuration
  Given I am logged in to graphql as super admin
  And I send a GraphQL POST request:
   """
   {
    "query": "mutation ($input: InternalCreateOauth2SSOConfigurationInput!) {
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
          profileUrl
          buttonColor
          labelColor
        }
      }
    }",
    "variables": {
      "input": {
        "name": "Test SSO",
        "enabled": true,
        "clientId": "test",
        "secret": "test",
        "authorizationUrl": "https://test.dev/auth",
        "accessTokenUrl": "https://test.dev/token",
        "userInfoUrl": "https://test.dev/userinfo",
        "logoutUrl": "https://test.dev/logout",
        "profileUrl": "https://test.dev/account",
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
      "createOauth2SSOConfiguration": {
        "ssoConfiguration": {
          "id": @string@,
          "name": "Test SSO",
          "enabled": true,
          "clientId": "test",
          "secret": "test",
          "authorizationUrl": "https://test.dev/auth",
          "accessTokenUrl": "https://test.dev/token",
          "userInfoUrl": "https://test.dev/userinfo",
          "logoutUrl": "https://test.dev/logout",
          "profileUrl": "https://test.dev/account",
          "buttonColor": "#CDCDCD",
          "labelColor": "#000000"
         }
       }
     }
  }
  """
