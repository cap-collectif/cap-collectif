@proposal_comments
Feature: Reportings for a comment

@datanase
Scenario: Admin wants to get reportings for a comment
  Given I am logged in to graphql as admin
  And I send a GraphQL POST request:
  """
  {
    "query": "query ($commentId: ID!) {
      comment: node(id: $commentId) {
          id
          ... on Comment {
              reportings {
                  totalCount
                  edges {
                      node {
                          id
                          type
                      }
                  }
              }
          }
      }
    }",
    "variables": {
      "commentId": "ideaComment1"
    }
  }
  """
  Then the JSON response should match:
  """
  {
    "data": {
        "comment": {
            "id": "ideaComment1",
            "reportings": {
                "totalCount": 1,
                "edges": [
                    {
                        "node": {
                            "id": "7",
                            "type": "SPAM"
                        }
                    },
                    @...@
                ]
            }
        }
    }
  }
  """
