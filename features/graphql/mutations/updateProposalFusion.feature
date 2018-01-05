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
      "updateProposalFusion": {
        "proposal": {
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

@security
Scenario: GraphQL client wants to update a fusion with only 1 proposal
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
      }
    }",
    "variables": {
      "input": {
        "fromProposals": ["proposal1"]
      }
    }
  }
  """
  Then the JSON response should match:
  """
  {
    "errors": [{"message":"You must specify at least 2 proposals to merge.","locations": @wildcard@,"path":["updateProposalFusion"]}],
    "data": {
      "updateProposalFusion": null
    }
  }
  """

@security
Scenario: GraphQL client wants to update a fusion with proposals from different forms
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
      }
    }",
    "variables": {
      "input": {
        "fromProposals": ["proposal1", "proposal8"]
      }
    }
  }
  """
  Then the JSON response should match:
  """
  {
    "errors": [{"message":"All proposals to merge should have the same proposalForm.","locations": @wildcard@,"path":["updateProposalFusion"]}],
    "data": {
      "updateProposalFusion": null
    }
  }
  """
