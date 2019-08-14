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
                  ... on FirstnameRequirement {
                    viewerValue
                  }
                  ... on DateOfBirthRequirement {
                    viewerDateOfBirth
                  }
                  ... on LastnameRequirement {
                    viewerValue
                  }
                  ... on PhoneRequirement {
                    viewerValue
                  }
                  ... on CheckboxRequirement {
                    id
                    label
                  }
                }
              }
            }
         }
      }
    }",
    "variables": {
      "proposalStepId": "collectstepVoteClassement"
    }
  }
  """
  Then the JSON response should match:
  """
  {
    "data": {
        "step": {
            "requirements": {
                "totalCount": 7,
                "viewerMeetsTheRequirements": false,
                "reason": @string@,
                "edges": [
                    {
                        "node": {
                            "viewerMeetsTheRequirement": true,
                            "viewerValue": "Utilisateur"
                        }
                    },
                    {
                        "node": {
                            "viewerMeetsTheRequirement": true,
                            "viewerValue": "authentifier"
                        }
                    },
                    {
                        "node": {
                            "viewerMeetsTheRequirement": true,
                            "viewerValue": "+33635492871"
                        }
                    },
                    {
                        "node": {
                            "viewerMeetsTheRequirement": true,
                            "id": "UmVxdWlyZW1lbnQ6cmVxdWlyZW1lbnQx",
                            "label": @string@
                        }
                    },
                    {
                        "node": {
                            "viewerMeetsTheRequirement": false,
                            "id": "UmVxdWlyZW1lbnQ6cmVxdWlyZW1lbnQy",
                            "label": @string@
                        }
                    },
                    {
                        "node": {
                            "viewerMeetsTheRequirement": false,
                            "id": "UmVxdWlyZW1lbnQ6cmVxdWlyZW1lbnQz",
                            "label": @string@
                        }
                    },
                    {
                        "node": {
                            "viewerMeetsTheRequirement": true,
                            "viewerDateOfBirth": @string@
                        }
                    }
                ]
            }
        }
    }
  }
  """
