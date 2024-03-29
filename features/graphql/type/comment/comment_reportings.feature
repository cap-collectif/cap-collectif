@proposal_comments
Feature: Reportings for a comment

@database
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
      "commentId": "Q29tbWVudDpldmVudENvbW1lbnQx"
    }
  }
  """
  Then the JSON response should match:
  """
  {
    "data": {
        "comment": {
            "id": "Q29tbWVudDpldmVudENvbW1lbnQx",
            "reportings": {
                "totalCount": 1,
                "edges": [
                    {
                        "node": {
                            "id": "6",
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
