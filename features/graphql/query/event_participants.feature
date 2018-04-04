@event
Feature: Event participants

Scenario: GraphQL client want to get the list of participants of an event
  Given I send a GraphQL POST request:
  """
  {
    "query": "query node ($event: ID!){
      event: node(id: $event) {
        ... on Event {
          participants(first: 5) {
            totalCount
            pageInfo {
              hasNextPage
              endCursor
            }
            edges {
              node {
                ... on User {
                  id
                }
                ... on NotRegistred {
                  username
                  email
                }
              }
            }
          }
        }
      }
    }",
    "variables": {
      "event": 1
    }
  }
  """
  Then the JSON response should match:
  """
  {
    "data": {
      "event": {
        "participants": {
          "totalCount": 28,
          "pageInfo": {
            "hasNextPage": true,
            "endCursor": "YXJyYXljb25uZWN0aW9uOjQ="
          },
          "edges": [
            { "node": { "id":"user1" } },
            { "node": { "id":"user3" } },
            { "node": { "username": @string@, "email": @string@ }},
            { "node": { "username": @string@, "email": @string@ }},
            { "node": { "username": @string@, "email": @string@ }}
          ]
        }
      }
    }
  }
  """
