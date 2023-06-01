@proposal_comments
Feature: Selection step proposal votes connection

Scenario: Admin wants to get votes for a proposal in a selection step
  Given I am logged in to graphql as admin
  And I send a GraphQL POST request:
  """
  {
    "query": "query ($selectionStepId: ID!, $count: Int) {
      selectionStep: node(id: $selectionStepId) {
          id
          ... on SelectionStep {
              isSecretBallot
              canDisplayBallot
              proposals(first: $count) {
                  totalCount
                  edges {
                      node {
                          id
                          votes(first: $count, stepId: $selectionStepId) {
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
       "selectionStep":{
          "id":"U2VsZWN0aW9uU3RlcDpzZWxlY3Rpb25zdGVwMQ==",
          "isSecretBallot":false,
          "canDisplayBallot":true,
          "proposals":{
             "totalCount":3,
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

Scenario: Admin wants to get votes for a question in a selection step
  Given I am logged in to graphql as admin
  And I send a GraphQL POST request:
  """
  {
    "query": "query ($selectionStepId: ID!, $count: Int) {
      selectionStep: node(id: $selectionStepId) {
          id
          ... on SelectionStep {
              isSecretBallot
              canDisplayBallot
              proposals(first: $count) {
                  totalCount
                  edges {
                      node {
                          id
                          votes(first: $count, stepId: $selectionStepId) {
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
                objectType
              }
          }
      }
    }",
    "variables": {
      "selectionStepId": "U2VsZWN0aW9uU3RlcDpzZWxlY3Rpb25RdWVzdGlvblN0ZXBWb3RlQ2xhc3NlbWVudA==",
      "count": 3
    }
  }
  """
  Then the JSON response should match:
  """
  {
     "data":{
        "selectionStep":{
           "id":"U2VsZWN0aW9uU3RlcDpzZWxlY3Rpb25RdWVzdGlvblN0ZXBWb3RlQ2xhc3NlbWVudA==",
           "isSecretBallot":false,
          "canDisplayBallot":true,
           "proposals":{
              "totalCount":1,
              "edges":[
                 {
                    "node":{
                       "id":"UHJvcG9zYWw6cXVlc3Rpb24x",
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
              "objectType":"QUESTION"
           }
        }
     }
  }
  """

Scenario: Admin wants to get votes for a proposal with secret ballot
  Given I am logged in to graphql as admin
  And I send a GraphQL POST request:
  """
  {
    "query": "query ($selectionStepId: ID!, $count: Int) {
      selectionStep: node(id: $selectionStepId) {
          id
          ... on SelectionStep {
              isSecretBallot
              canDisplayBallot
              proposals(first: $count) {
                  totalCount
                  edges {
                      node {
                          id
                          votes(first: $count, stepId: $selectionStepId) {
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
                objectType
              }
          }
      }
    }",
    "variables": {
      "selectionStepId": "U2VsZWN0aW9uU3RlcDpzZWxlY3Rpb25TdGVwSWRmM1ZvdGU=",
      "count": 3
    }
  }
  """
  Then the JSON response should match:
  """
  {
    "data": {
      "selectionStep": {
        "id": "U2VsZWN0aW9uU3RlcDpzZWxlY3Rpb25TdGVwSWRmM1ZvdGU=",
        "isSecretBallot": true,
        "canDisplayBallot": false,
        "proposals": {
          "totalCount": 303,
          "edges": [
            {
              "node": {
                "id": "UHJvcG9zYWw6cHJvcG9zaXRpb25Qb3VyVGVzdExlRG91Ymxvbg==",
                "votes": {
                  "totalCount": 0,
                  "edges": []
                }
              }
            },
            {
              "node": {
                "id": "UHJvcG9zYWw6cHJvcG9zYWxCeUZyYW5jZUNvbm5lY3RVc2Vy",
                "votes": {
                  "totalCount": 2,
                  "edges": [
                    {
                      "node": {
                        "id": "1063"
                      }
                    },
                    {
                      "node": {
                        "id": "1065"
                      }
                    }
                  ]
                }
              }
            },
            {
              "node": {
                "id": "UHJvcG9zYWw6cHJvcG9zYWxMb2NhdGlvbldpdGhvdXRBZGRyZXNz",
                "votes": {
                  "totalCount": 0,
                  "edges": []
                }
              }
            }
          ]
        },
        "form": {
          "objectType": "PROPOSAL"
        }
      }
    }
  }
  """
