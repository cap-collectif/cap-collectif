@project @read-only
Feature: Project

Scenario: GraphQL user wants to get list of trashed comments.
  Given I am logged in to graphql as pierre
  And I send a GraphQL POST request:
  """
  {
    "query": "query getTrashedComments($projectId: ID!, $first: Int, $onlyTrashed: Boolean, $orderBy: CommentOrder!) {
      node(id: $projectId) {
        id
        ... on Project {
          comments(first: $first, onlyTrashed: $onlyTrashed, orderBy: $orderBy) {
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
      "projectId": "UHJvamVjdDpwcm9qZWN0Ng==",
      "first": 10,
      "onlyTrashed": true,
      "orderBy": { "field": "PUBLISHED_AT", "direction": "DESC" }
    }
  }
  """
  Then the JSON response should match:
  """
  {
    "data":{
      "node":{
        "id":"UHJvamVjdDpwcm9qZWN0Ng==",
        "comments":{
          "totalCount":70,
          "edges":[
            {
              "node":{
                "id":"Q29tbWVudDp0cmFzaGVkQ29tbWVudDE="
              }
            },
            {
              "node":{
                "id":"Q29tbWVudDp0cmFzaGVkQ29tbWVudDEw"
              }
            },
            {
              "node":{
                "id":"Q29tbWVudDp0cmFzaGVkQ29tbWVudDEx"
              }
            },
            {
              "node":{
                "id":"Q29tbWVudDp0cmFzaGVkQ29tbWVudDEy"
              }
            },
            {
              "node":{
                "id":"Q29tbWVudDp0cmFzaGVkQ29tbWVudDEz"
              }
            },
            {
              "node":{
                "id":"Q29tbWVudDp0cmFzaGVkQ29tbWVudDE0"
              }
            },
            {
              "node":{
                "id":"Q29tbWVudDp0cmFzaGVkQ29tbWVudDE1"
              }
            },
            {
              "node":{
                "id":"Q29tbWVudDp0cmFzaGVkQ29tbWVudDE2"
              }
            },
            {
              "node":{
                "id":"Q29tbWVudDp0cmFzaGVkQ29tbWVudDE3"
              }
            },
            {
              "node":{
                "id":"Q29tbWVudDp0cmFzaGVkQ29tbWVudDE4"
              }
            }
          ]
        }
      }
    }
  }
  """
