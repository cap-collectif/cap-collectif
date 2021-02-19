@debate
Feature: Get published user's debateVotes

Scenario: GraphQL anonymous want to get debateVotes of a user
  And I send a GraphQL POST request:
  """
    {
      "query": "query getUserDebateVotes($userId: ID!) {
        user: node(id: $userId) {
          ... on User {
            debateVotes {
              totalCount
              edges {
                node {
                  id
                }
              }
            }
          }
        }
      }",
      "variables": {
        "userId": "VXNlcjp1c2VyVGhlbw=="
      }
    }
  """
  Then the JSON response should match:
  """
    {
      "data": {
        "user": {
          "debateVotes": {
            "totalCount": 1,
            "edges": [
              {
                "node": {
                  "id": "RGViYXRlVm90ZToxMzAwNA=="
                }
              }
            ]
          }
        }
      }
    }
  """
