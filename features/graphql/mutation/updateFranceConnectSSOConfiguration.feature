@updateFranceConnectSSOConfiguration @admin
Feature: Update France Connect SSO Configuration

@database
Scenario: Admin wants to update France Connect configuration
  Given I am logged in to graphql as super admin
  And I send a GraphQL POST request:
   """
   {
    "query": "mutation ($input: UpdateFranceConnectSSOConfigurationInput!) {
      updateFranceConnectSSOConfiguration(input: $input) {
        fcConfiguration {
          environment
          clientId
          secret
          authorizationUrl
          accessTokenUrl
          userInfoUrl
          logoutUrl
          allowedData
        }
      }
    }",
    "variables": {
      "input": {
        "environment": "TESTING",
        "clientId": "account",
        "secret": "***REMOVED***",
        "given_name": true,
        "family_name": true,
        "birthdate": true,
        "birthplace": false,
        "birthcountry": false,
        "gender": true,
        "email": true,
        "preferred_username": false
      }
    }
  }
  """
  Then the JSON response should match:
  """
  {
     "data":{
        "updateFranceConnectSSOConfiguration":{
           "fcConfiguration":{
              "environment":"TESTING",
              "clientId":"account",
              "secret":"***REMOVED***",
              "authorizationUrl":"https:\/\/fcp.integ01.dev-franceconnect.fr\/api\/v1\/authorize",
              "accessTokenUrl":"https:\/\/fcp.integ01.dev-franceconnect.fr\/api\/v1\/token",
              "userInfoUrl":"https:\/\/fcp.integ01.dev-franceconnect.fr\/api\/v1\/userinfo",
              "logoutUrl":"https:\/\/fcp.integ01.dev-franceconnect.fr\/api\/v1\/logout",
              "allowedData":[
                 "given_name",
                 "family_name",
                 "birthdate",
                 "gender",
                 "email"
              ]
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
    "query": "mutation ($input: UpdateFranceConnectSSOConfigurationInput!) {
      updateFranceConnectSSOConfiguration(input: $input) {
        fcConfiguration {
          environment
          clientId
          secret
          authorizationUrl
          accessTokenUrl
          userInfoUrl
          logoutUrl
          allowedData
        }
      }
    }",
    "variables": {
      "input": {
        "environment": "PRODUCTION",
        "clientId": "account",
        "secret": "***REMOVED***",
        "given_name": true,
        "family_name": true,
        "birthdate": true,
        "birthplace": false,
        "birthcountry": false,
        "gender": true,
        "email": true,
        "preferred_username": false
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
          "environment": "PRODUCTION",
          "allowedData":[
             "given_name",
             "family_name",
             "birthdate",
             "gender",
             "email"
          ]
         }
       }
     }
  }
  """
