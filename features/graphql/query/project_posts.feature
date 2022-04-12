@project @read-only
Feature: Project

Scenario: GraphQL user get posts linked to project
  Given I send a GraphQL POST request:
  """
  {
    "query": "query getProjectPosts($projectId: ID!) {
      node(id: $projectId) {
        ... on Project {
          posts {
            totalCount
            edges {
              node {
                title
                isPublished
                publishedAt
              }
            }
          }
        }
      }
    }",
    "variables": {
      "projectId": "UHJvamVjdDpwcm9qZWN0Mg=="
    }
  }
  """
  Then the JSON response should match:
  """
  {
    "data":{
      "node":{
        "posts":{
          "totalCount": 5,
          "edges": [
            {
              "node": {
                "title": "Post FR 10",
                "isPublished": true,
                "publishedAt": "2018-11-05 00:00:01"
              }
            },
            {
              "node": {
                "title": "Post FR 9",
                "isPublished": true,
                "publishedAt": "2018-11-05 00:00:00"
              }
            }
          ]
        }
      }
    }
  }
  """