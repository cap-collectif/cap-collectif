@step
Feature: Step contributors

@elasticsearch
Scenario: GraphQL client want to get the list of contributors of a consultation
  Given I send a GraphQL POST request:
  """
  {
    "query": "query node ($consultation: ID!){
      consultation: node(id: $consultation) {
        ... on Consultation {
          contributors(first: 5) {
            totalCount
            pageInfo {
              hasNextPage
              endCursor
            }
            edges {
              node {
                id
              }
            }
          }
        }
      }
    }",
    "variables": {
      "consultation": "Q29uc3VsdGF0aW9uOmNzdGVwMQ=="
    }
  }
  """
  Then the JSON response should match:
  """
  {
    "data": {
      "consultation": {
        "contributors": {
          "totalCount": @integer@,
          "pageInfo": {
            "hasNextPage": true,
            "endCursor": "YXJyYXljb25uZWN0aW9uOjQ="
          },
          "edges": [
            { "node": { "id": @string@ } },
            { "node": { "id": @string@ } },
            { "node": { "id": @string@ } },
            { "node": { "id": @string@ } },
            { "node": { "id": @string@ } }
          ]
        }
      }
    }
  }
  """

@elasticsearch
Scenario: GraphQL client want to get the list of contributors of a collectStep
  Given I send a GraphQL POST request:
  """
  {
    "query": "query node ($collectStep: ID!){
      collectStep: node(id: $collectStep) {
        ... on CollectStep {
          contributors(first: 5) {
            totalCount
            anonymousCount
            pageInfo {
              hasNextPage
              endCursor
            }
            edges {
              node {
                _id
              }
            }
          }
        }
      }
    }",
    "variables": {
      "collectStep": "Q29sbGVjdFN0ZXA6Y29sbGVjdHN0ZXAx"
    }
  }
  """
  Then the JSON response should match:
  """
{
   "data":{
      "collectStep":{
         "contributors":{
            "totalCount":4,
            "anonymousCount":0,
            "pageInfo":{
               "hasNextPage":false,
               "endCursor":"YXJyYXljb25uZWN0aW9uOjM="
            },
            "edges":[
               {
                  "node":{
                     "_id":"user5"
                  }
               },
               {
                  "node":{
                     "_id":"user502"
                  }
               },
               {
                  "node":{
                     "_id":"user7"
                  }
               },
               {
                  "node":{
                     "_id":"userAdmin"
                  }
               }
            ]
         }
      }
   }
}
  """

@elasticsearch
Scenario: GraphQL client want to get the list of contributors of a selectionStep
  Given I send a GraphQL POST request:
  """
  {
    "query": "query node ($selectionStep: ID!){
      selectionStep: node(id: $selectionStep) {
        ... on SelectionStep {
          contributors(first: 5) {
            totalCount
            pageInfo {
              hasNextPage
              endCursor
            }
            edges {
              node {
                _id
              }
            }
          }
        }
      }
    }",
    "variables": {
      "selectionStep": "U2VsZWN0aW9uU3RlcDpzZWxlY3Rpb25zdGVwMQ=="
    }
  }
  """
  Then the JSON response should match:
  """
  {
    "data": {
      "selectionStep": {
        "contributors": {
          "totalCount": 46,
          "pageInfo": {
            "hasNextPage": true,
            "endCursor": "YXJyYXljb25uZWN0aW9uOjQ="
          },
          "edges": [
            {"node":{"_id":"user10"}},
            {"node":{"_id":"user11"}},
            {"node":{"_id":"user12"}},
            {"node":{"_id":"user13"}},
            {"node":{"_id":"user14"}}
          ]
        }
      }
    }
  }
  """

@elasticsearch
Scenario: GraphQL client want to get the list of contributors of a questionnaireStep
  Given I send a GraphQL POST request:
  """
  {
    "query": "query node ($questionnaireStep: ID!){
      questionnaireStep: node(id: $questionnaireStep) {
        ... on QuestionnaireStep {
          contributors(first: 5) {
            totalCount
            pageInfo {
              hasNextPage
              endCursor
            }
            edges {
              node {
                _id
              }
            }
          }
        }
      }
    }",
    "variables": {
      "questionnaireStep": "questionnairestep1"
    }
  }
  """
  Then the JSON response should match:
  """
  {
    "data": {
      "questionnaireStep": {
        "contributors": {
          "totalCount": 4,
          "pageInfo": {
            "hasNextPage": false,
            "endCursor": "YXJyYXljb25uZWN0aW9uOjM="
          },
          "edges": [
            {"node":{"_id":"user502"}},
            {"node":{"_id":"user506"}},
            {"node":{"_id":"user515"}},
            {"node":{"_id":"userAdmin"}}
          ]
        }
      }
    }
  }
  """
