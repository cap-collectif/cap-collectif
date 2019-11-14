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
      "consultation": "Q29uc3VsdGF0aW9uOmRlZmF1bHQ="
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
            "totalCount":6,
            "anonymousCount":0,
            "pageInfo":{
               "hasNextPage": true,
               "endCursor": "YXJyYXljb25uZWN0aW9uOjQ="
            },
            "edges":[
               {
                  "node":{
                     "_id":"user7"
                  }
               },
               {
                  "node":{
                     "_id":"user502"
                  }
               },
               {
                  "node":{
                     "_id":"user5"
                  }
               },
               {
                  "node":{
                     "_id":"userAdmin"
                  }
               },
               {
                 "node": {
                    "_id": "user2"
                 }
              }
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
          "totalCount": 5,
          "pageInfo": {
            "hasNextPage": false,
            "endCursor": "YXJyYXljb25uZWN0aW9uOjQ="
          },
          "edges": [
            {
              "node": {
                "_id": "user515"
              }
            },
            {
              "node": {
                "_id": "user_not_confirmed"
              }
            },
            {
              "node": {
                "_id": "user502"
              }
            },
            {
              "node": {
                "_id": "user5"
              }
            },
            {
              "node": {
                "_id": "userAdmin"
              }
            }
          ]
        }
      }
    }
  }
  """
