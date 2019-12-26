@changeSource
Feature: Change Source

@database
Scenario: Author wants to update his source
  Given I am logged in to graphql as user
  And I send a GraphQL POST request:
   """
   {
    "query": "mutation ($input: ChangeSourceInput!) {
      changeSource(input: $input) {
        source {
          id
          body
          updatedAt
        }
      }
    }",
    "variables": {
      "input": {
        "sourceId": "source1",
        "body": "New Tololo"
      }
    }
  }
  """
  Then the JSON response should match:
  """
  {
    "data": {
      "changeSource": {
        "source": {
          "id": "source1",
          "body": "New Tololo",
          "updatedAt": "@string@.isDateTime()"
        }
      }
    }
  }
  """

@security
Scenario: User wants to update a source but is not the author
  Given I am logged in to graphql as pierre
  And I send a GraphQL POST request:
   """
   {
    "query": "mutation ($input: ChangeSourceInput!) {
      changeSource(input: $input) {
        source {
          id
        }
      }
    }",
    "variables": {
      "input": {
        "sourceId": "source1",
        "body": "New Tololo"
      }
    }
  }
  """
  Then the JSON response should match:
  """
  {"errors":[{"message":"Can't update the source of someone else.","@*@": "@*@"}],"data":{"changeSource":null}}
  """
