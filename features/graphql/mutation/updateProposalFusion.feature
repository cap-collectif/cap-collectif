@proposal @update_proposal_fusion
Feature: Update Proposal Fusion

@database
Scenario: GraphQL client wants to update a fusion
  Given I am logged in to graphql as admin
  And I send a GraphQL POST request:
  """
  {
    "query": "mutation ($input: UpdateProposalFusionInput!) {
      updateProposalFusion (input: $input) {
        proposal {
          id
          mergedFrom {
            id
          }
        }
        removedMergedFrom {
          id
        }
      }
    }",
    "variables": {
      "input": {
        "proposalId": "UHJvcG9zYWw6cHJvcG9zYWwx",
        "fromProposals": ["UHJvcG9zYWw6cHJvcG9zYWwy", "UHJvcG9zYWw6cHJvcG9zYWwz"]
      }
    }
  }
  """
  Then the JSON response should match:
  """
  {
    "data": {
      "updateProposalFusion": {
        "proposal": {
          "id": "UHJvcG9zYWw6cHJvcG9zYWwx",
          "mergedFrom": [
            {
              "id": "UHJvcG9zYWw6cHJvcG9zYWwy"
            },
            {
              "id": "UHJvcG9zYWw6cHJvcG9zYWwz"
            }
          ]
        },
        "removedMergedFrom": []
      }
    }
  }
  """
  And I send a GraphQL POST request:
  """
  {
    "query": "mutation ($input: UpdateProposalFusionInput!) {
      updateProposalFusion (input: $input) {
        proposal {
          id
          mergedFrom {
            id
          }
        }
        removedMergedFrom {
          id
        }
      }
    }",
    "variables": {
      "input": {
        "proposalId": "UHJvcG9zYWw6cHJvcG9zYWwx",
        "fromProposals": ["UHJvcG9zYWw6cHJvcG9zYWwz", "UHJvcG9zYWw6cHJvcG9zYWw0"]
      }
    }
  }
  """
  Then the JSON response should match:
  """
  {
    "data": {
      "updateProposalFusion": {
        "proposal": {
          "id": "UHJvcG9zYWw6cHJvcG9zYWwx",
          "mergedFrom": [
            {
              "id": "UHJvcG9zYWw6cHJvcG9zYWwz"
            },
            {
              "id": "UHJvcG9zYWw6cHJvcG9zYWw0"
            }
          ]
        },
        "removedMergedFrom": [
          {
            "id": "UHJvcG9zYWw6cHJvcG9zYWwy"
          }
        ]
      }
    }
  }
  """
