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
            }
            edges {
              node {
                ... on User {
                  id
                }
                ... on NotRegistered {
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
      "event": "event1"
    }
  }
  """
  Then the JSON response should match:
  """
  {
    "data": {
      "event": {
        "participants": {
          "totalCount": 50,
          "pageInfo": {
            "hasNextPage": true
          },
          "edges": [
            { "node": { "id":"user1" } },
            { "node": { "username": @string@, "email": @string@ }},
            { "node": { "username": @string@, "email": @string@ }},
            { "node": { "username": @string@, "email": @string@ }},
            { "node": { "username": @string@, "email": @string@ }}
          ]
        }
      }
    }
  }
  """
