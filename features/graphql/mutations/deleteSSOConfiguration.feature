@deleteSSOConfiguration
Feature: Delete SSO Configuration

@database
Scenario: Admin wants to delete a SSO configuration
  Given I am logged in to graphql as super admin
  And I send a GraphQL POST request:
   """
   {
    "query": "mutation ($input: InternalDeleteSSOConfigurationInput!) {
      deleteSSOConfiguration(input: $input) {
        deletedSsoConfigurationId
      }
    }",
    "variables": {
      "input": {
       "id": "T2F1dGgyU1NPQ29uZmlndXJhdGlvbjpzc29PYXV0aDI="
      }
    }
  }
  """
  Then the JSON response should match:
  """
  {"data":{"deleteSSOConfiguration":{"deletedSsoConfigurationId":"T2F1dGgyU1NPQ29uZmlndXJhdGlvbjpzc29PYXV0aDI="}}}
  """
