@source @vote
Feature: Votes for a comment

@database
Scenario: Admin wants to get votes for a source
  Given I am logged in to graphql as admin
  And I send a GraphQL POST request:
  """
  {
    "query": "query ($commentId: ID!) {
      source: node(id: $commentId) {
          id
          ... on Source {
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
      "commentId": "U291cmNlOnNvdXJjZTQz"
    }
  }
  """
  Then the JSON response should match:
  """
  {
    "data": {
        "source": {
            "id": "U291cmNlOnNvdXJjZTQz",
            "votes": {
                "totalCount": 2,
                "edges": [
                    {
                        "node": {
                            "id": "60003"
                        }
                    },
                    {
                        "node": {
                            "id": "60002"
                        }
                    }
                ]
            }
        }
    }
  }
  """
