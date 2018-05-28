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
            anonymousCount
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
          "totalCount": 28,
          "anonymousCount": 0,
          "pageInfo": {
            "hasNextPage": true,
            "endCursor": "YXJyYXljb25uZWN0aW9uOjQ="
          },
          "edges": [
            {"node":{"id":"user1"}},
            {"node":{"id":"user11"}},
            {"node":{"id":"user12"}},
            {"node":{"id":"user13"}},
            {"node":{"id":"user16"}}
          ]
        }
      }
    }
  }
  """
