@changeEvent
Feature: Change Event

@database
Scenario: Admin wants to change an event
  Given I am logged in to graphql as admin
  And I send a GraphQL POST request:
   """
   {
    "query": "mutation ($input: ChangeEventInput!) {
      changeEvent(input: $input) {
        eventEdge {
          node {
            id
            _id
            title
            body
            author {
              _id
            }
          }
        }
      }
    }",
    "variables": {
      "input": {
        "id": "RXZlbnQ6ZXZlbnQx",
        "title": "Rencontre avec les habitants",
        "body": "Tout le monde est invité",
        "startAt": "2018-03-07 00:00:00",
        "endAt": "2018-03-16 00:00:00"
      }
    }
  }
  """
  Then the JSON response should match:
  """
  {
    "data": {
      "changeEvent": {
          "eventEdge": {
              "node": {
                "id": "RXZlbnQ6ZXZlbnQx",
                "_id": "event1",
                "title": "Rencontre avec les habitants",
                "body": "Tout le monde est invité",
                "author": {
                  "_id": @string@
                }
              }
          }
       }
     }
  }
  """
