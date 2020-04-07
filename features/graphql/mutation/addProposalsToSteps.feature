@addProposalsToSteps @proposals @steps
Feature: Add a CollectStep to a Proposal

@database
Scenario: Admin sends no valid proposal and receives an error
  Given I am logged in to graphql as admin
  And I send a GraphQL POST request:
  """
  {
    "query": "mutation ($input: AddProposalsToStepsInput!) {
      addProposalsToSteps(input: $input) {
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
      "addProposalsToSteps": {
        "error": "NO_VALID_PROPOSAL",
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
    "query": "mutation ($input: AddProposalsToStepsInput!) {
      addProposalsToSteps(input: $input) {
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
      "addProposalsToSteps": {
        "error": "NO_VALID_STEP"
      }
    }
  }
  """

@database
Scenario: Admin add an already present step to a proposal
  Given I am logged in to graphql as admin
  And I send a GraphQL POST request:
  """
  {
    "query": "mutation ($input: AddProposalsToStepsInput!) {
      addProposalsToSteps(input: $input) {
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
        "stepIds": ["U2VsZWN0aW9uU3RlcDpzZWxlY3Rpb25zdGVwMQ=="]
      }
    }
  }
  """
  Then the JSON response should match:
  """
  {
    "data": {
      "addProposalsToSteps": {
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
Scenario: Admin add a step to two proposals, one already having it
  Given I am logged in to graphql as admin
  And I send a GraphQL POST request:
  """
  {
    "query": "mutation ($input: AddProposalsToStepsInput!) {
      addProposalsToSteps(input: $input) {
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
      "addProposalsToSteps": {
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
                  },
                  {
                    "step": {
                      "id": "U2VsZWN0aW9uU3RlcDpzZWxlY3Rpb25zdGVwMg=="
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
                  },
                  {
                    "step": {
                      "id": "U2VsZWN0aW9uU3RlcDpzZWxlY3Rpb25zdGVwMg=="
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
