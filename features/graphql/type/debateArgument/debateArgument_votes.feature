@debate @debateArgument @vote
Feature: Votes for a debateArgument

@database
Scenario: Admin wants to get votes for a debateArgument
  Given I am logged in to graphql as admin
  And I send a GraphQL POST request:
  """
  {
    "query": "query ($debateArgumentId: ID!) {
      debateArgument: node(id: $debateArgumentId) {
          id
          ... on DebateArgument {
              votes {
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
      "debateArgumentId": "RGViYXRlQXJndW1lbnQ6ZGViYXRlQXJndW1lbnQy"
    }
  }
  """
  Then the JSON response should match:
  """
  {
    "data": {
        "debateArgument": {
            "id": "RGViYXRlQXJndW1lbnQ6ZGViYXRlQXJndW1lbnQy",
            "votes": {
                "totalCount": 2,
                "edges": [
                    {
                        "node": {
                            "id": "RGViYXRlQXJndW1lbnRWb3RlOjEyMDAy"
                        }
                    },
                    {
                        "node": {
                            "id": "RGViYXRlQXJndW1lbnRWb3RlOjEyMDAx"
                        }
                    }
                ]
            }
        }
    }
  }
  """
