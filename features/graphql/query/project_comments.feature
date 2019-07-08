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
                _id
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
                "_id":"trashedComment70"
              }
            },
            {
              "node":{
                "_id":"trashedComment69"
              }
            },
            {
              "node":{
                "_id":"trashedComment68"
              }
            },
            {
              "node":{
                "_id":"trashedComment67"
              }
            },
            {
              "node":{
                "_id":"trashedComment66"
              }
            },
            {
              "node":{
                "_id":"trashedComment65"
              }
            },
            {
              "node":{
                "_id":"trashedComment64"
              }
            },
            {
              "node":{
                "_id":"trashedComment63"
              }
            },
            {
              "node":{
                "_id":"trashedComment62"
              }
            },
            {
              "node":{
                "_id":"trashedComment61"
              }
            }
          ]
        }
      }
    }
  }
  """
