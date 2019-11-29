@setDefaultLocale
Feature: setDefaultLocale

@database
Scenario: GraphQL client wants to change the default locale
  Given I am logged in to graphql as admin
  And I send a GraphQL POST request:
  """
  {
    "query": "mutation ($input: SetDefaultLocaleInput!) {
      setDefaultLocale(input: $input) {
        locale {
          id
          isEnabled
          isPublished
          isDefault
        }
      }
    }",
    "variables": {
      "input": {
        "id": "locale-en-GB"
      }
    }
  }
  """
  Then the JSON response should match:
  """
  {
    "data": {
      "setDefaultLocale": {
        "locale": {
          "id": "locale-en-GB",
          "isEnabled": true,
          "isPublished": true,
          "isDefault": true
        }
      }
    }
  }
  """
