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
      "consultation": "cstep1"
    }
  }
  """
  Then the JSON response should match:
  """
  {
    "data": {
      "consultation": {
        "contributors": {
          "totalCount": 24,
          "pageInfo": {
            "hasNextPage": true,
            "endCursor": "YXJyYXljb25uZWN0aW9uOjQ="
          },
          "edges": [
            {
              "node": {
                "id": @string@
              }
            },
            @...@
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
      "collectStep": "collectstep1"
    }
  }
  """
  Then the JSON response should match:
  """
  {
    "data": {
      "collectStep": {
        "contributors": {
          "totalCount": 24,
          "pageInfo": {
            "hasNextPage": true,
            "endCursor": "YXJyYXljb25uZWN0aW9uOjQ="
          },
          "edges": [
            {
              "node": {
                "id": @string@
              }
            },
            @...@
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
        ... on CollectStep {
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
      "selectionStep": "selectionstep1"
    }
  }
  """
  Then the JSON response should match:
  """
  {
    "data": {
      "selectionStep": {
        "contributors": {
          "totalCount": 24,
          "pageInfo": {
            "hasNextPage": true,
            "endCursor": "YXJyYXljb25uZWN0aW9uOjQ="
          },
          "edges": [
            {
              "node": {
                "id": @string@
              }
            },
            @...@
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
        ... on CollectStep {
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
          "totalCount": 24,
          "pageInfo": {
            "hasNextPage": true,
            "endCursor": "YXJyYXljb25uZWN0aW9uOjQ="
          },
          "edges": [
            {
              "node": {
                "id": @string@
              }
            },
            @...@
          ]
        }
      }
    }
  }
  """
