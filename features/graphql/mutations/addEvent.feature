@addEvent
Feature: Add Event

@database
Scenario: Admin wants to add an event
  Given I am logged in to graphql as admin
  And I send a GraphQL POST request:
   """
   {
    "query": "mutation ($input: AddEventInput!) {
      addEvent(input: $input) {
        eventEdge {
          node {
            id
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
      "addEvent": {
          "eventEdge": {
              "node": {
                "id": @string@,
                "title": "Rencontre avec les habitants",
                "body": "Tout le monde est invité",
                "author": {
                  "_id": "userAdmin"
                }
              }
          }
       }
     }
  }
  """
