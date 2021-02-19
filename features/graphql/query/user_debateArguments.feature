@debate
Feature: Get published user's debateArguments

Scenario: GraphQL anonymous want to get debateArguments of a user
  And I send a GraphQL POST request:
  """
    {
      "query": "query getUserDebateArguments($userId: ID!) {
        user: node(id: $userId) {
          ... on User {
            debateArguments {
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
          "debateArguments": {
            "totalCount": 2,
            "edges": [
              {
                "node": {
                  "id": "RGViYXRlQXJndW1lbnQ6ZGViYXRlQXJndW1lbnQy"
                }
              },
              {
                "node": {
                  "id": "RGViYXRlQXJndW1lbnQ6ZGViYXRlQ29uZmluZW1lbnQx"
                }
              }
            ]
          }
        }
      }
    }
  """

Scenario: GraphQL anonymous want to get debateArguments of a user, ordered by lower popularity
  And I send a GraphQL POST request:
  """
    {
      "query": "query getUserDebateArguments($userId: ID!) {
        user: node(id: $userId) {
          ... on User {
            debateArguments(
              orderBy: {
                field: VOTE_COUNT
                direction: ASC
              }
            ) {
              totalCount
              edges {
                node {
                  id
                  votes {
                    totalCount
                  }
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
          "debateArguments": {
            "totalCount": 2,
            "edges": [
              {
                "node": {
                  "id": "RGViYXRlQXJndW1lbnQ6ZGViYXRlQ29uZmluZW1lbnQx",
                  "votes": {
                    "totalCount": 0
                  }
                }
              },
              {
                "node": {
                  "id": "RGViYXRlQXJndW1lbnQ6ZGViYXRlQXJndW1lbnQy",
                  "votes": {
                    "totalCount": 2
                  }
                }
              }
            ]
          }
        }
      }
    }
  """
