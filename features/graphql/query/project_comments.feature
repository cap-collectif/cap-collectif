@project @read-only
Feature: Project

Scenario: GraphQL user wants to get list of trashed comments.
  Given I am logged in to graphql as pierre
  Given I send a GraphQL POST request:
  """
  {
    "query": "query getTrashedComments($projectId: ID!, $first: Int, $onlyTrashed: Boolean) {
      node(id: $projectId) {
        id
        ... on Project {
          comments(first: $first, onlyTrashed: $onlyTrashed) {
            totalCount
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
      "projectId": "project6",
      "first": 10,
      "onlyTrashed": true
    }
  }
  """
  Then the JSON response should match:
  """
  {
    "data":{
      "node": {
        "id":"project6",
        "comments":{
          "totalCount":70,
          "edges":[
            {
              "node": {
                "id": "trashedComment1"
              }
            },
            {
              "node": {
                "id": "trashedComment10"
              }
            },
            {
              "node": {
                "id": "trashedComment11"
              }
            },
            {
              "node": {
                "id": "trashedComment12"
              }
            },
            {
              "node": {
                "id": "trashedComment13"
              }
            },
            {
              "node": {
                "id": "trashedComment14"
              }
            },
            {
              "node": {
                "id": "trashedComment15"
              }
            },
            {
              "node": {
                "id": "trashedComment16"
              }
            },
            {
              "node": {
                "id": "trashedComment17"
              }
            },
            {
              "node": {
                "id": "trashedComment18"
              }
            }
          ]
        }
      }
    }
  }
"""
