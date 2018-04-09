@proposals
Feature: Proposal Order By

@elasticsearch
Scenario: GraphQL client want to order proposals by CREATED_AT ASC
  Given I send a GraphQL POST request:
  """
  {
    "query": "query node ($proposalForm: ID!){
      proposalForm: node(id: $proposalForm) {
        ... on ProposalForm {
          proposals(orderBy: {field: CREATED_AT, direction: ASC}) {
            edges {
              node {
                id
                createdAt
              }
            }
          }
        }
      }
    }",
    "variables": {
      "proposalForm": "proposalform1"
    }
  }
  """
  Then the JSON response should match:
  """
  {
     "data": {
        "proposalForm": {
           "proposals": {
              "edges":[
                {
                  "node": {
                    "id": "proposal1",
                    "createdAt": "2015-01-01 00:00:00"
                  }
                },
                {
                  "node": {
                    "id": "proposal2",
                    "createdAt": "2015-02-01 00:00:00"
                  }
                },
                {
                  "node": {
                    "id": "proposal3",
                    "createdAt": "2015-03-01 00:00:00"
                  }
                },
                {
                  "node": {
                    "id": "proposal10",
                    "createdAt": "2018-04-06 17:24:47"
                  }
                },
                {
                  "node": {
                    "id": "proposal11",
                    "createdAt": "2018-04-06 17:24:47"
                  }
                },
                {
                  "node": {
                    "id": "proposal4",
                    "createdAt": "2018-04-06 17:24:47"
                  }
                }
              ]
           }
        }
     }
  }
  """

@elasticsearch
Scenario: GraphQL client want to order proposals by CREATED_AT DESC
  Given I send a GraphQL POST request:
  """
  {
    "query": "query node ($proposalForm: ID!){
      proposalForm: node(id: $proposalForm) {
        ... on ProposalForm {
          proposals(orderBy: {field: CREATED_AT, direction: DESC}) {
            edges {
              node {
                id
                createdAt
              }
            }
          }
        }
      }
    }",
    "variables": {
      "proposalForm": "proposalform1"
    }
  }
  """
  Then the JSON response should match:
  """
  {
     "data": {
        "proposalForm": {
           "proposals": {
              "edges":[
                  {
                    "node": {
                      "id": "proposal10",
                      "createdAt": "2018-04-06 17:24:47"
                    }
                  },
                  {
                    "node": {
                      "id": "proposal11",
                      "createdAt": "2018-04-06 17:24:47"
                    }
                  },
                  {
                    "node": {
                      "id": "proposal4",
                      "createdAt": "2018-04-06 17:24:47"
                    }
                  },
                  {
                    "node": {
                      "id": "proposal3",
                      "createdAt": "2015-03-01 00:00:00"
                    }
                  },
                  {
                    "node": {
                      "id": "proposal2",
                      "createdAt": "2015-02-01 00:00:00"
                    }
                  },
                  {
                    "node": {
                      "id": "proposal1",
                      "createdAt": "2015-01-01 00:00:00"
                    }
                  }
              ]
           }
        }
     }
  }
  """

@elasticsearch
Scenario: GraphQL client want to order proposals by COMMENTS
  Given I send a GraphQL POST request:
  """
  {
    "query": "query node ($proposalForm: ID!){
      proposalForm: node(id: $proposalForm) {
        ... on ProposalForm {
          proposals(orderBy: {field: COMMENTS, direction: DESC}) {
            edges {
              node {
                id
                commentsCount
              }
            }
          }
        }
      }
    }",
    "variables": {
      "proposalForm": "proposalform1"
    }
  }
  """
  Then the JSON response should match:
  """
  {
     "data": {
        "proposalForm": {
           "proposals": {
              "edges":[
                 {
                  "node": {
                    "id": "proposal1",
                    "commentsCount": 20
                  }
                },
                {
                  "node": {
                    "id": "proposal10",
                    "commentsCount": 0
                  }
                },
                {
                  "node": {
                    "id": "proposal11",
                    "commentsCount": 0
                  }
                },
                {
                  "node": {
                    "id": "proposal2",
                    "commentsCount": 0
                  }
                },
                {
                  "node": {
                    "id": "proposal3",
                    "commentsCount": 0
                  }
                },
                {
                  "node": {
                    "id": "proposal4",
                    "commentsCount": 0
                  }
                }
              ]
           }
        }
     }
  }
  """

@elasticsearch
Scenario: GraphQL client want to randomize proposals
  Given I am logged in to graphql as user
  And I send a GraphQL POST request:
  """
  {
    "query": "query node ($proposalForm: ID!){
      proposalForm: node(id: $proposalForm) {
        ... on ProposalForm {
          proposals(orderBy: {field: RANDOM, direction: DESC}) {
            edges {
              node {
                id
                createdAt
              }
            }
          }
        }
      }
    }",
    "variables": {
      "proposalForm": "proposalform1"
    }
  }
  """
  And I store the result
  And I am logged in to graphql as admin
  And I send a GraphQL POST request:
  """
  {
    "query": "query node ($proposalForm: ID!){
      proposalForm: node(id: $proposalForm) {
        ... on ProposalForm {
          proposals(orderBy: {field: RANDOM, direction: DESC}) {
            edges {
              node {
                id
                createdAt
              }
            }
          }
        }
      }
    }",
    "variables": {
      "proposalForm": "proposalform1"
    }
  }
  """
  Then the current result should not math with the stored result
