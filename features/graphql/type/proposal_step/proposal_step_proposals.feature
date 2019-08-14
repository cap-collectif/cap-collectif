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
            form {
              isProposalForm
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
            },
           "form":{
              "isProposalForm":true
           }
        }
    }
  }
  """

@database @questionAnswer
Scenario: User wants to see questions in a question step
  And I send a GraphQL POST request:
  """
  {
    "query": "query ($questionStepId: ID!) {
      step: node(id: $questionStepId) {
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
            form {
              isProposalForm
            }
         }
      }
    }",
    "variables": {
      "questionStepId": "collectQuestionVoteAvecClassement"
    }
  }
  """
  Then the JSON response should match:
  """
  {
     "data":{
        "step":{
           "proposals":{
              "totalCount":2,
              "edges":[
                 {
                    "node":{
                       "id":"UHJvcG9zYWw6cXVlc3Rpb24x",
                       "published":true
                    }
                 },
                 {
                    "node":{
                       "id":"UHJvcG9zYWw6cXVlc3Rpb24y",
                       "published":true
                    }
                 }
              ]
           },
           "form":{
              "isProposalForm":false
           }
        }
     }
  }
  """
