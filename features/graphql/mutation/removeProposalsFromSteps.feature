@removeProposalsToSteps @proposals @steps
Feature: Remove a CollectStep from a proposal

@database
Scenario: Admin sends no valid proposal and receives an error
  Given I am logged in to graphql as admin
  And I send a GraphQL POST request:
  """
  {
    "query": "mutation ($input: RemoveProposalsFromStepsInput!) {
      removeProposalsFromSteps(input: $input) {
        error
        proposals {
          edges {
            node {
              id
            }
          }
        }
      }
    }",
    "variables": {
      "input": {
        "proposalIds": ["idonotexist", "meneither"],
        "stepIds": ["nostep"]
      }
    }
  }
  """
  Then the JSON response should match:
  """
  {
    "data": {
      "removeProposalsFromSteps": {
        "error": "no valid proposal",
        "proposals": {
          "edges": []
        }
      }
    }
  }
  """

@database
Scenario: Admin sends step not matching the project or not a collect step and receives an error
  Given I am logged in to graphql as admin
  And I send a GraphQL POST request:
  """
  {
    "query": "mutation ($input: RemoveProposalsFromStepsInput!) {
      removeProposalsFromSteps(input: $input) {
        error
      }
    }",
    "variables": {
      "input": {
        "proposalIds": ["UHJvcG9zYWw6cHJvcG9zYWwx"],
        "stepIds": ["collectstep1", "selectionQuestionStepVoteClassement"]
      }
    }
  }
  """
  Then the JSON response should match:
  """
  {
    "data": {
      "removeProposalsFromSteps": {
        "error": "no valid step"
      }
    }
  }
  """

@database
Scenario: Admin wants to remove a proposal not present in a step
  Given I am logged in to graphql as admin
  And I send a GraphQL POST request:
  """
  {
    "query": "mutation ($input: RemoveProposalsFromStepsInput!) {
      removeProposalsFromSteps(input: $input) {
        error
        proposals {
          edges {
            node {
              id
              selections {
                step {
                  id
                }
              }
            }
          }
        }
      }
    }",
    "variables": {
      "input": {
        "proposalIds": ["UHJvcG9zYWw6cHJvcG9zYWwx"],
        "stepIds": ["U2VsZWN0aW9uU3RlcDpzZWxlY3Rpb25zdGVwMg=="]
      }
    }
  }
  """
  Then the JSON response should match:
  """
  {
    "data": {
      "removeProposalsFromSteps": {
        "error": null,
        "proposals": {
          "edges": [
            {
              "node": {
                "id": "UHJvcG9zYWw6cHJvcG9zYWwx",
                "selections": [
                  {
                    "step": {
                      "id": "U2VsZWN0aW9uU3RlcDpzZWxlY3Rpb25zdGVwMQ=="
                    }
                  }
                ]
              }
            }
          ]
        }
      }
    }
  }
  """

@database @rabbitmq
Scenario: Admin remove a step from two proposals, only one having it
  Given I am logged in to graphql as admin
  And I send a GraphQL POST request:
  """
  {
    "query": "mutation ($input: RemoveProposalsFromStepsInput!) {
      removeProposalsFromSteps(input: $input) {
        error
        proposals {
          edges {
            node {
              id
              selections {
                step {
                  id
                }
              }
            }
          }
        }
      }
    }",
    "variables": {
      "input": {
        "proposalIds": ["UHJvcG9zYWw6cHJvcG9zYWwx", "UHJvcG9zYWw6cHJvcG9zYWwy"],
        "stepIds": ["U2VsZWN0aW9uU3RlcDpzZWxlY3Rpb25zdGVwMg=="]
      }
    }
  }
  """
  Then the JSON response should match:
  """
  {
    "data": {
      "removeProposalsFromSteps": {
        "error": null,
        "proposals": {
          "edges": [
            {
              "node": {
                "id": "UHJvcG9zYWw6cHJvcG9zYWwx",
                "selections": [
                  {
                    "step": {
                      "id": "U2VsZWN0aW9uU3RlcDpzZWxlY3Rpb25zdGVwMQ=="
                    }
                  }
                ]
              }
            },
            {
              "node": {
                "id": "UHJvcG9zYWw6cHJvcG9zYWwy",
                "selections": [
                  {
                    "step": {
                      "id": "U2VsZWN0aW9uU3RlcDpzZWxlY3Rpb25zdGVwMQ=="
                    }
                  }
                ]
              }
            }
          ]
        }
      }
    }
  }
  """

