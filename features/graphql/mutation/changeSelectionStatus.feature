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
            "stepId": "U2VsZWN0aW9uU3RlcDpzZWxlY3Rpb25zdGVwMQ==",
            "proposalId": "UHJvcG9zYWw6cHJvcG9zYWwz",
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
            "step": { "id": "U2VsZWN0aW9uU3RlcDpzZWxlY3Rpb25zdGVwMQ==" },
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
        "stepId": "U2VsZWN0aW9uU3RlcDpzZWxlY3Rpb25zdGVwMQ==",
        "proposalId": "UHJvcG9zYWw6cHJvcG9zYWwz",
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
            "step": { "id": "U2VsZWN0aW9uU3RlcDpzZWxlY3Rpb25zdGVwMQ==" },
            "status": null
          }]
        }
      }
    }
  }
  """
