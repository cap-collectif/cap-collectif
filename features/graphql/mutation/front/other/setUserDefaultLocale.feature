@setUserDefaultLocale @other
Feature: setUserDefaultLocale

@database
Scenario: User wants to change his default locale to en-GB
  Given I am logged in to graphql as admin
  And I send a GraphQL POST request:
  """
  {
    "query": "mutation ($input: SetUserDefaultLocaleInput!) {
      setUserDefaultLocale(input: $input) {
        code
      }
    }",
    "variables": {
      "input": {
        "userId": "VXNlcjp1c2VyNQ==",
        "code": "en-GB"
      }
    }
  }
  """
  Then the JSON response should match:
  """
  {
    "data": {
      "setUserDefaultLocale": {
        "code": "en-GB"
      }
    }
  }
  """

@database
Scenario: User wants to change his default locale to en-GB
  Given I am logged in to graphql as admin
  And I send a GraphQL POST request:
  """
  {
    "query": "mutation ($input: SetUserDefaultLocaleInput!) {
      setUserDefaultLocale(input: $input) {
        code
      }
    }",
    "variables": {
      "input": {
        "userId": "VXNlcjp1c2VyNQ==",
        "code": "en-GB"
      }
    }
  }
  """
  Then the JSON response should match:
  """
  {
    "data": {
      "setUserDefaultLocale": {
        "code": "en-GB"
      }
    }
  }
  """
