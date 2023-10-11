@addProposalsToSteps @proposals @steps @add
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
        steps {
          id
        }
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
        "error": "NO_VALID_PROPOSAL",
        "steps": [],
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
        steps {
          id
        }
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
        "error": "NO_VALID_STEP",
        "steps": []
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
        steps {
          id
        }
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
        "steps": [{
          "id": "U2VsZWN0aW9uU3RlcDpzZWxlY3Rpb25zdGVwMQ=="
        }],
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
Scenario: Admin add a step to two proposals, one already having it. The new step has default status
  Given I am logged in to graphql as admin
  And I send a GraphQL POST request:
  """
  {
    "query": "mutation ($input: AddProposalsToStepsInput!) {
      addProposalsToSteps(input: $input) {
        error
        steps {
          id
        }
        proposals {
          edges {
            node {
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
        "steps": [{
          "id": "U2VsZWN0aW9uU3RlcDpzZWxlY3Rpb25zdGVwMg=="
        }],
        "proposals": {
          "edges": [
            {
              "node": {
                "id": "UHJvcG9zYWw6cHJvcG9zYWwx",
                "selections": [
                  {
                    "step": {
                      "id": "U2VsZWN0aW9uU3RlcDpzZWxlY3Rpb25zdGVwMQ=="
                    },
                    "status": {
                      "id": "status4"
                    }
                  },
                  {
                    "step": {
                      "id": "U2VsZWN0aW9uU3RlcDpzZWxlY3Rpb25zdGVwMg=="
                    },
                    "status": {
                      "id": "status6"
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
                    },
                    "status": {
                      "id": "status5"
                    }
                  },
                  {
                    "step": {
                      "id": "U2VsZWN0aW9uU3RlcDpzZWxlY3Rpb25zdGVwMg=="
                    },
                    "status": null
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
