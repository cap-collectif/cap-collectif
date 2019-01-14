@selectProposal
Feature: selectProposal

@database
Scenario: GraphQL client wants select a proposal without status
  Given I am logged in to graphql as admin
  And I send a GraphQL POST request:
  """
    {
    "query": "mutation ($input: SelectProposalInput!) {
      selectProposal(input: $input) {
        proposal {
          id
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
        "proposalId": "proposal8",
        "statusId": null
      }
    }
  }
  """
  Then the JSON response should match:
  """
    {
      "data": {
        "selectProposal": {
          "proposal": {
            "id": "proposal8",
            "selections": [
              {
                "step": { "id": "selectionstep4" },
                "status": null
              },
              {
                "step": { "id": "selectionstep1" },
                "status": null
              }
            ]
          }
        }
      }
    }
  """

@database
Scenario: GraphQL client wants select a proposal with status, then unselect
  Given I am logged in to graphql as admin
  And I send a GraphQL POST request:
  """
  {
  "query": "mutation ($input: SelectProposalInput!) {
    selectProposal(input: $input) {
      proposal {
        id
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
      "proposalId": "proposal8",
      "statusId": "status1"
    }
  }
  }
  """
  Then the JSON response should match:
  """
  {
    "data": {
      "selectProposal": {
        "proposal": {
          "id": "proposal8",
          "selections": [
            {
              "step": { "id": "selectionstep4" },
              "status": null
            },
            {
              "step": { "id": "selectionstep1" },
              "status": { "id": "status1" }
            }
          ]
        }
      }
    }
  }
  """
  When I send a GraphQL POST request:
  """
  {
    "query": "mutation ($input: UnselectProposalInput!) {
      unselectProposal(input: $input) {
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
        "proposalId": "proposal8"
      }
    }
  }
  """
  Then the JSON response should match:
  """
  {
    "data": {
      "unselectProposal": {
        "proposal": {
          "selections": [
            {
              "step": { "id": "selectionstep4" },
              "status": null
            }
          ]
        }
      }
    }
  }
  """
