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
        "eventId": "evenementFutureSansDateDeFin"
      }
    }
  }
  """
  Then the JSON response should match:
  """
  {"data":{"removeEvent":{"deletedEventId":"evenementFutureSansDateDeFin"}}}
  """
