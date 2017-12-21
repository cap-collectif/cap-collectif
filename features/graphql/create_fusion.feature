@proposal @create_fusion
Feature: Proposals Fusion

@database
Scenario: GraphQL client wants to create a fusion
  Given I am logged in to graphql as admin
  And I send a GraphQL POST request:
  """
    {
      "query": "mutation ($input: CreateFusionInput!) {
        createProposalFusion (input: $input) {
          proposal {
            author {
              id
            }
            adminUrl
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
        "createProposalFusion": {
          "proposal": {
            "author": {
              "id": "userAdmin"
            },
            "adminUrl": @string@,
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
