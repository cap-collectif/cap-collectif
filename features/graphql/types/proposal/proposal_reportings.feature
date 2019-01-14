@proposal_comments
Feature: Reportings for a proposal

@database
Scenario: Admin wants to get reportings for a proposal
  Given I am logged in to graphql as admin
  And I send a GraphQL POST request:
  """
  {
    "query": "query ($proposalId: ID!) {
      proposal: node(id: $proposalId) {
          id
          ... on Proposal {
              reportings {
                  totalCount
                  edges {
                      node {
                          id
                          body
                      }
                  }
              }
          }
      }
    }",
    "variables": {
      "proposalId": "UHJvcG9zYWw6cHJvcG9zYWwx"
    }
  }
  """
  Then the JSON response should match:
  """
  {
    "data": {
        "proposal": {
            "id": "UHJvcG9zYWw6cHJvcG9zYWwx",
            "reportings": {
                "totalCount": 1,
                "edges": [
                    {
                        "node": {
                            "id": "2",
                            "body": @string@
                        }
                    },
                    @...@
                ]
            }
        }
    }
  }
  """
