@updateLocaleStatus
Feature: updateLocaleStatus

@database
Scenario: GraphQL client wants to update status of a locale
  Given I am logged in to graphql as admin
  And I send a GraphQL POST request:
  """
  {
    "query": "mutation ($input: UpdateLocaleStatusInput!) {
      updateLocaleStatus(input: $input) {
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
        "id": "locale-de-DE",
        "enabled": true,
        "published": true
      }
    }
  }
  """
  Then the JSON response should match:
  """
  {
    "data": {
      "updateLocaleStatus": {
        "locale": {
          "id": "locale-de-DE",
          "isEnabled": true,
          "isPublished": true,
          "isDefault": false
        }
      }
    }
  }
  """

@database
Scenario: GraphQL client wants to publish a disabled language and get error
  Given I am logged in to graphql as admin
  And I send a GraphQL POST request:
  """
  {
    "query": "mutation ($input: UpdateLocaleStatusInput!) {
      updateLocaleStatus(input: $input) {
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
        "id": "locale-de-DE",
        "enabled": false,
        "published": true
      }
    }
  }
  """
  Then the JSON response should match:
  """
  {
    "errors": [
      {
        "message": "Locale configuration error",
        "extensions": {"category": "user"},
        "locations": [{"line": 1, "column": 50}],
        "path": ["updateLocaleStatus"]
      }
    ],
    "data": {
      "updateLocaleStatus": null
    }
  }
  """
