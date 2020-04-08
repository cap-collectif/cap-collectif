@applyProposalStatus @proposals @steps
Feature: Apply a Status to a Proposal

@database
Scenario: Admin sends no valid status and receives an error
  Given I am logged in to graphql as admin
  And I send a GraphQL POST request:
  """
  {
    "query": "mutation ($input: ApplyProposalStatusInput!) {
      applyProposalStatus(input: $input) {
        error
      }
    }",
    "variables": {
      "input": {
        "proposalIds": ["idonotexist", "meneither"],
        "statusId": "nostatus"
      }
    }
  }
  """
  Then the JSON response should match:
  """
  {
    "data": {
      "applyProposalStatus": {
        "error": "NO_VALID_STATUS"
      }
    }
  }
  """

@database
Scenario: Admin sends proposal not matching the step of the status and receives an error
  Given I am logged in to graphql as admin
  And I send a GraphQL POST request:
  """
  {
    "query": "mutation ($input: ApplyProposalStatusInput!) {
      applyProposalStatus(input: $input) {
        error
      }
    }",
    "variables": {
      "input": {
        "proposalIds": ["UHJvcG9zYWw6cHJvcG9zYWwx"],
        "statusId": "status6"
      }
    }
  }
  """
  Then the JSON response should match:
  """
  {
    "data": {
      "applyProposalStatus": {
        "error": "NO_VALID_PROPOSAL"
      }
    }
  }
  """

@database
Scenario: Admin does not change the status of a proposal
  Given I am logged in to graphql as admin
  And I send a GraphQL POST request:
  """
  {
    "query": "mutation ($input: ApplyProposalStatusInput!) {
      applyProposalStatus(input: $input) {
        error
        proposals {
          edges {
            node {
              id
              status {
                id
              }
              selections {
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
        "proposalIds": ["UHJvcG9zYWw6cHJvcG9zYWwx"],
        "statusId": "status4"
      }
    }
  }
  """
  Then the JSON response should match:
  """
  {
    "data": {
      "applyProposalStatus": {
        "error": null,
        "proposals": {
          "edges": [
            {
              "node": {
                "id": "UHJvcG9zYWw6cHJvcG9zYWwx",
                "status": {
                  "id": "status1"
                },
                "selections": [
                  {
                    "status": {
                      "id": "status4"
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
Scenario: Admin changes the status of a selection step in a proposal
  Given I am logged in to graphql as admin
  And I send a GraphQL POST request:
  """
  {
    "query": "mutation ($input: ApplyProposalStatusInput!) {
      applyProposalStatus(input: $input) {
        error
        proposals {
          edges {
            node {
              id
              status {
                id
              }
              selections {
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
        "proposalIds": ["UHJvcG9zYWw6cHJvcG9zYWwx"],
        "statusId": "status5"
      }
    }
  }
  """
  Then the JSON response should match:
  """
  {
    "data": {
      "applyProposalStatus": {
        "error": null,
        "proposals": {
          "edges": [
            {
              "node": {
                "id": "UHJvcG9zYWw6cHJvcG9zYWwx",
                "status": {
                  "id": "status1"
                },
                "selections": [
                  {
                    "status": {
                      "id": "status5"
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
Scenario: Admin changes the status of the collection step in a proposal
  Given I am logged in to graphql as admin
  And I send a GraphQL POST request:
  """
  {
    "query": "mutation ($input: ApplyProposalStatusInput!) {
      applyProposalStatus(input: $input) {
        error
        proposals {
          edges {
            node {
              id
              status {
                id
              }
              selections {
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
        "proposalIds": ["UHJvcG9zYWw6cHJvcG9zYWwx"],
        "statusId": "status2"
      }
    }
  }
  """
  Then the JSON response should match:
  """
  {
    "data": {
      "applyProposalStatus": {
        "error": null,
        "proposals": {
          "edges": [
            {
              "node": {
                "id": "UHJvcG9zYWw6cHJvcG9zYWwx",
                "status": {
                  "id": "status2"
                },
                "selections": [
                  {
                    "status": {
                      "id": "status4"
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
Scenario: Admin removes the status of a proposal
  Given I am logged in to graphql as admin
  And I send a GraphQL POST request:
  """
  {
    "query": "mutation ($input: ApplyProposalStatusInput!) {
      applyProposalStatus(input: $input) {
        error
        proposals {
          edges {
            node {
              id
              status {
                id
              }
              selections {
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
        "proposalIds": ["UHJvcG9zYWw6cHJvcG9zYWwx"],
        "statusId": null
      }
    }
  }
  """
  Then the JSON response should match:
  """
  {
    "data": {
      "applyProposalStatus": {
        "error": null,
        "proposals": {
          "edges": [
            {
              "node": {
                "id": "UHJvcG9zYWw6cHJvcG9zYWwx",
                "status": null,
                "selections": [
                  {
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
