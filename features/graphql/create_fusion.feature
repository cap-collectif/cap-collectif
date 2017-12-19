@proposal @create_fusion
Feature: Proposals Fusion

@database
Scenario: GraphQL client wants to create a fusion
  Given I am logged in to graphql as admin
  And I send a GraphQL POST request:
  """
    {
      "query": "mutation ($input: CreateFusionInput!) {
        createFusion (input: $input) {
          proposal {
            author {
              id
            }
            mergedFrom {
              id
            }
          }
        }
      }",
      "variables": {
        "input": {
          "fromProposals": ["proposal1", "proposal2"]
        }
      }
    }
  """
  Then the JSON response should match:
  """
    {
      "data": {
        "createFusion": {
          "proposal": {
            "author": {
              "id": "user2"
            },
            "mergedFrom": [
              {
                "id": "proposal1"
              },
              {
                "id": "proposal2"
              }
            ]
          }
        }
      }
    }
  """
