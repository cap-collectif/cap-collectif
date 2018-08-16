@proposal_step_proposals
Feature: Proposal step proposals

@database
Scenario: User wants to see proposals in a proposal step
  And I send a GraphQL POST request:
  """
  {
    "query": "query ($proposalStepId: ID!) {
      step: node(id: $proposalStepId) {
        ... on ProposalStep {
            proposals {
              totalCount
              edges {
                node {
                   id
                   published
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
            "proposals": {
                "totalCount": 3,
                "edges": [
                    {
                        "node": {
                            "id": @string@,
                            "published": true
                        }
                    },
                    @...@
                ]
            }
        }
    }
  }
  """
