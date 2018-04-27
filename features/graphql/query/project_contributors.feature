@project
Feature: Project contributors

@elasticsearch
Scenario: GraphQL client want to get the list of contributors
  Given I send a GraphQL POST request:
  """
  {
    "query": "query node ($project: ID!){
      project: node(id: $project) {
        ... on Project {
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
      "project": "project1"
    }
  }
  """
  Then the JSON response should match:
  """
  {
    "data": {
      "project": {
        "contributors": {
          "totalCount": 26,
          "pageInfo": {
            "hasNextPage": true,
            "endCursor": "YXJyYXljb25uZWN0aW9uOjQ="
          },
          "edges": [
            {"node":{"id":"user1"}},
            {"node":{"id":"user10"}},
            {"node":{"id":"user13"}},
            {"node":{"id":"user17"}},
            {"node":{"id":"user18"}}
          ]
        }
      }
    }
  }
  """
