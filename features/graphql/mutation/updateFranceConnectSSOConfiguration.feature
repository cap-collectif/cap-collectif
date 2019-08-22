@updateFranceConnectSSOConfiguration
Feature: Update France Connect SSO Configuration

@database
Scenario: Admin wants to update France Connect configuration
  Given I am logged in to graphql as super admin
  And I send a GraphQL POST request:
   """
   {
    "query": "mutation ($input: InternalUpdateFranceConnectSSOConfigurationInput!) {
      updateFranceConnectSSOConfiguration(input: $input) {
        fcConfiguration {
          environment
          clientId
          secret
          authorizationUrl
          accessTokenUrl
          userInfoUrl
          logoutUrl
        }
      }
    }",
    "variables": {
      "input": {
        "environment": "TESTING",
        "clientId": "account",
        "secret": "***REMOVED***"
      }
    }
  }
  """
  Then the JSON response should match:
  """
  {
    "data": {
      "updateFranceConnectSSOConfiguration": {
        "fcConfiguration": {
          "clientId": "account",
          "secret": "***REMOVED***",
          "authorizationUrl": "https://fcp.integ01.dev-franceconnect.fr/api/v1/authorize",
          "accessTokenUrl": "https://fcp.integ01.dev-franceconnect.fr/api/v1/token",
          "userInfoUrl": "https://fcp.integ01.dev-franceconnect.fr/api/v1/userinfo",
          "logoutUrl": "https://fcp.integ01.dev-franceconnect.fr/api/v1/logout",
          "environment": "TESTING"
         }
       }
     }
  }
  """

@database
Scenario: Admin wants to update France Connect configuration and turn it to production mode
  Given I am logged in to graphql as super admin
  And I send a GraphQL POST request:
  """
  {
    "query": "mutation ($input: InternalUpdateFranceConnectSSOConfigurationInput!) {
      updateFranceConnectSSOConfiguration(input: $input) {
        fcConfiguration {
          environment
          clientId
          secret
          authorizationUrl
          accessTokenUrl
          userInfoUrl
          logoutUrl
        }
      }
    }",
    "variables": {
      "input": {
        "environment": "PRODUCTION",
        "clientId": "account",
        "secret": "***REMOVED***"
      }
    }
  }
  """
  Then the JSON response should match:
  """
  {
    "data": {
      "updateFranceConnectSSOConfiguration": {
        "fcConfiguration": {
          "clientId": "account",
          "secret": "***REMOVED***",
          "authorizationUrl": "https://app.franceconnect.gouv.fr/api/v1/authorize",
          "accessTokenUrl": "https://app.franceconnect.gouv.fr/api/v1/token",
          "userInfoUrl": "https://app.franceconnect.gouv.fr/api/v1/userinfo",
          "logoutUrl": "https://app.franceconnect.gouv.fr/api/v1/logout",
          "environment": "PRODUCTION"
         }
       }
     }
  }
  """
