@removeEvent
Feature: mutation removeEvent

@database
Scenario: Logged in API client wants delete his event
  Given I am logged in to graphql as admin
  And I send a GraphQL POST request:
  """
  {
    "query": "mutation ($input: RemoveEventInput!) {
      removeEvent(input: $input) {
        deletedEventId
      }
    }",
    "variables": {
      "input": {
        "eventId": "RXZlbnQ6ZXZlbmVtZW50RnV0dXJlU2Fuc0RhdGVEZUZpbg=="
      }
    }
  }
  """
  Then the JSON response should match:
  """
  {"data":{"removeEvent":{"deletedEventId":"RXZlbnQ6ZXZlbmVtZW50RnV0dXJlU2Fuc0RhdGVEZUZpbg=="}}}
  """
