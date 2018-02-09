@groups
Feature: Groups

Scenario: GraphQL client wants to list groups
  Given I am logged in to graphql as admin
  And I send a GraphQL POST request:
  """
  {
    "query": "query {
      groups {
        id
        title
      }
    }"
  }
  """
  Then the JSON response should match:
  """
  {
    "data": {
      "groups": [
        {
          "id": @string@,
          "title": @string@
        },
        @...@
      ]
    }
  }
  """
