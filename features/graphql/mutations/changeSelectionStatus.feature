@proposal
Feature: Proposals

@database
Scenario: GraphQL client wants to update proposal status
  Given I am logged in to graphql as admin
  And I send a GraphQL POST request:
  """
  {
    "query": "mutation ($input: ChangeSelectionStatusInput!) {
      changeSelectionStatus(input: $input) {
        proposal {
          selections {
            step {
              id
            }
            status {
              id
            }
          }
        }
      }
    }",
    "variables": {
      "input": {
            "stepId": "selectionstep1",
            "proposalId": "proposal3",
            "statusId": "status1"
          }
        }
      }
  """
  Then the JSON response should match:
  """
  {
    "data": {
      "changeSelectionStatus": {
        "proposal": {
          "selections": [{
            "step": { "id": "selectionstep1" },
            "status": { "id": "status1" }
          }]
        }
      }
    }
  }
  """
  When I send a GraphQL POST request:
  """
  {
    "query": "mutation ($input: ChangeSelectionStatusInput!) {
      changeSelectionStatus(input: $input) {
        proposal {
          selections {
            step {
              id
            }
            status {
              id
            }
          }
        }
      }
    }",
    "variables": {
      "input": {
        "stepId": "selectionstep1",
        "proposalId": "proposal3",
        "statusId": null
      }
    }
  }
  """
  Then the JSON response should match:
  """
  {
    "data": {
      "changeSelectionStatus": {
        "proposal": {
          "selections": [{
            "step": { "id": "selectionstep1" },
            "status": null
          }]
        }
      }
    }
  }
  """
