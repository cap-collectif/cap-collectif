@requirements
Feature: Proposal step requirements

@database
Scenario: User wants to see requirements to vote in a proposal step
  Given I am logged in to graphql as user
  And I send a GraphQL POST request:
  """
  {
    "query": "query ($proposalStepId: ID!) {
      step: node(id: $proposalStepId) {
        ... on ProposalStep {
            requirements {
              totalCount
              viewerMeetsTheRequirements
              reason
              edges {
                node {
                  viewerMeetsTheRequirement
                }
              }
            }
         }
      }
    }",
    "variables": {
      "proposalStepId": "selectionstep1"
    }
  }
  """
  Then the JSON response should match:
  """
  {
    "data": {
        "step": {
            "requirements": {
                "totalCount": 6,
                "viewerMeetsTheRequirements": false,
                "reason": @string@,
                "edges": [
                    {
                        "node": {
                            "viewerMeetsTheRequirement": false
                        }
                    },
                    {
                        "node": {
                            "viewerMeetsTheRequirement": false
                        }
                    },
                    {
                        "node": {
                            "viewerMeetsTheRequirement": false
                        }
                    },
                    {
                        "node": {
                            "viewerMeetsTheRequirement": false
                        }
                    },
                    {
                        "node": {
                            "viewerMeetsTheRequirement": false
                        }
                    },
                    {
                        "node": {
                            "viewerMeetsTheRequirement": false
                        }
                    }
                ]
            }
        }
    }
  }
  """
