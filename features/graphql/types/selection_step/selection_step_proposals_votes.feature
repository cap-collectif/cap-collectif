@proposal_comments
Feature: Selection step proposal votes connection

@database
Scenario: Admin wants to get votes for a proposal in a selection step
  Given I am logged in to graphql as admin
  And I send a GraphQL POST request:
  """
  {
    "query": "query ($selectionStepId: ID!, $count: Int, $orderBy: ProposalVotesOrder) {
      selectionStep: node(id: $selectionStepId) {
          id
          ... on SelectionStep {
              proposals(first: $count) {
                  totalCount
                  edges {
                      node {
                          id
                          votes(first: $count, stepId: $selectionStepId, orderBy: $orderBy) {
                              totalCount
                              edges {
                                node {
                                    id
                                }
                              }
                          }
                      }
                  }
              }
          }
      }
    }",
    "variables": {
      "selectionStepId": "U2VsZWN0aW9uU3RlcDpzZWxlY3Rpb25zdGVwMQ==",
      "count": 3
    }
  }
  """
  Then the JSON response should match:
  """
  {
    "data": {
        "selectionStep": {
            "id": "U2VsZWN0aW9uU3RlcDpzZWxlY3Rpb25zdGVwMQ==",
            "proposals": {
                "totalCount": 3,
                "edges": [
                    {
                        "node": {
                            "id": @string@,
                            "votes": {
                                "totalCount": @integer@,
                                "edges": @array@
                            }
                        }
                    },
                    @...@
                ]
            }
        }
    }
  }
  """

@database
Scenario: Admin wants to get votes for a question in a selection step
  Given I am logged in to graphql as admin
  And I send a GraphQL POST request:
  """
  {
    "query": "query ($selectionStepId: ID!, $count: Int, $orderBy: ProposalVotesOrder) {
      selectionStep: node(id: $selectionStepId) {
          id
          ... on SelectionStep {
              proposals(first: $count) {
                  totalCount
                  edges {
                      node {
                          id
                          votes(first: $count, stepId: $selectionStepId, orderBy: $orderBy) {
                              totalCount
                              edges {
                                node {
                                    id
                                }
                              }
                          }
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
      "selectionStepId": "selectionQuestionStepVoteClassement",
      "count": 3
    }
  }
  """
  Then the JSON response should match:
  """
  {
     "data":{
        "selectionStep":{
           "id":"selectionQuestionStepVoteClassement",
           "proposals":{
              "totalCount":1,
              "edges":[
                 {
                    "node":{
                       "id":"question1",
                       "votes":{
                          "totalCount":1,
                          "edges":[
                             {
                                "node":{
                                   "id":"@string@"
                                }
                             }
                          ]
                       }
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
