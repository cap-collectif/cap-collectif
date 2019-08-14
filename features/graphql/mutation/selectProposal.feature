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
        "stepId": "U2VsZWN0aW9uU3RlcDpzZWxlY3Rpb25zdGVwMQ==",
        "proposalId": "UHJvcG9zYWw6cHJvcG9zYWw4",
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
            "id": "UHJvcG9zYWw6cHJvcG9zYWw4",
            "selections": [
              {
                "step": { "id": "U2VsZWN0aW9uU3RlcDpzZWxlY3Rpb25zdGVwNA==" },
                "status": null
              },
              {
                "step": { "id": "U2VsZWN0aW9uU3RlcDpzZWxlY3Rpb25zdGVwMQ==" },
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
      "stepId": "U2VsZWN0aW9uU3RlcDpzZWxlY3Rpb25zdGVwMQ==",
      "proposalId": "UHJvcG9zYWw6cHJvcG9zYWw4",
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
          "id": "UHJvcG9zYWw6cHJvcG9zYWw4",
          "selections": [
            {
              "step": { "id": "U2VsZWN0aW9uU3RlcDpzZWxlY3Rpb25zdGVwNA==" },
              "status": null
            },
            {
              "step": { "id": "U2VsZWN0aW9uU3RlcDpzZWxlY3Rpb25zdGVwMQ==" },
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
        "stepId": "U2VsZWN0aW9uU3RlcDpzZWxlY3Rpb25zdGVwMQ==",
        "proposalId": "UHJvcG9zYWw6cHJvcG9zYWw4"
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
              "step": { "id": "U2VsZWN0aW9uU3RlcDpzZWxlY3Rpb25zdGVwNA==" },
              "status": null
            }
          ]
        }
      }
    }
  }
  """
