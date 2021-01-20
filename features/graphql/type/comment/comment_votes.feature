@proposal_comments
Feature: Votes for a comment

@database
Scenario: Admin wants to get votes for a comment
  Given I am logged in to graphql as admin
  And I send a GraphQL POST request:
  """
  {
    "query": "query ($commentId: ID!) {
      comment: node(id: $commentId) {
          id
          ... on Comment {
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
            "votes": {
                "totalCount": 1,
                "edges": [
                    {
                        "node": {
                            "id": "90001"
                        }
                    }
                ]
            }
        }
    }
  }
  """
