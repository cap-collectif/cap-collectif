@proposals
Feature: proposal votes connection

@database
Scenario: User want to see expired votes on proposals
  Given I am logged in to graphql as user
  And I send a GraphQL POST request:
  """
  {
    "query": "query node ($proposalId: ID!, $first: Int, $stepId: ID!, $includeExpired: Boolean){
      proposal: node(id: $proposalId) {
        ... on Proposal {
          votes(first: $first, stepId: $stepId, includeExpired: $includeExpired ) {
            edges {
              node {
                id
                expired
              }
            }
          }
        }
      }
    }",
    "variables": {
      "proposalId": "proposal1",
      "stepId": "selectionstep8",
      "first": 50,
      "includeExpired": true
    }
  }
  """
  Then the JSON response should match:
  """
  {
     "data":{
        "proposal":{
           "votes":{
              "edges":[
                 {
                    "node":{
                       "id":"1054",
                       "expired":false
                    }
                 },
                 {
                    "node":{
                       "id":"1055",
                       "expired":false
                    }
                 }
              ]
           }
        }
     }
  }
  """
