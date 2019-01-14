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
        "proposalId": "proposal1",
        "fromProposals": ["proposal2", "proposal3"]
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
          "id": "proposal1",
          "mergedFrom": [
            {
              "id": "proposal2"
            },
            {
              "id": "proposal3"
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
        "proposalId": "proposal1",
        "fromProposals": ["proposal3", "proposal4"]
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
          "id": "proposal1",
          "mergedFrom": [
            {
              "id": "proposal3"
            },
            {
              "id": "proposal4"
            }
          ]
        },
        "removedMergedFrom": [
          {
            "id": "proposal2"
          }
        ]
      }
    }
  }
  """
