@proposals
Feature: Proposal Order By

@elasticsearch
Scenario: GraphQL client want to order proposals by COMMENTS
  Given I send a GraphQL POST request:
  """
  {
    "query": "query node ($proposalForm: ID!){
      proposalForm: node(id: $proposalForm) {
        ... on ProposalForm {
          proposals(first: 10, orderBy: {field: COMMENTS, direction: DESC}) {
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
          proposals(first: 10, orderBy: {field: RANDOM, direction: DESC}) {
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
          proposals(first: 10, orderBy: {field: RANDOM, direction: DESC}) {
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
  Then the current result should not match with the stored result
