@proposals @proposalVotes
Feature: proposal votes connection

@database
Scenario: User want to see unpublished votes on proposals
  Given I am logged in to graphql as user
  And I send a GraphQL POST request:
  """
  {
    "query": "query node ($proposalId: ID!, $first: Int, $stepId: ID!, $includeUnpublished: Boolean){
      proposal: node(id: $proposalId) {
        ... on Proposal {
          votes(first: $first, stepId: $stepId, includeUnpublished: $includeUnpublished ) {
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
      "proposalId": "proposal1",
      "stepId": "selectionstep8",
      "first": 50,
      "includeUnpublished": true
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
                       "id": @string@,
                       "published": @boolean@
                    }
                 },
                @...@
              ]
           }
        }
     }
  }
  """
