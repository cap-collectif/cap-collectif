@version_votes
Feature: Version votes connection

@database
Scenario: Anonymous wants to get votes for an version
  Given I send a GraphQL POST request:
  """
  {
    "query": "query ($versionId: ID!) {
      version: node(id: $versionId) {
        ... on Version {
          votes(first: 10) {
            totalCount
            pageInfo {
              hasNextPage
            }
            edges {
              cursor
              node {
                id
                author {
                  id
                }
                value
              }
            }
          }
        }
      }
    }",
    "variables": {
      "versionId": "version2"
    }
  }
  """
  Then the JSON response should match:
  """
  {
    "data": {
      "version": {
        "votes": {
          "totalCount": 50,
          "pageInfo": {
            "hasNextPage": true
          },
          "edges": [
            {
              "cursor": @string@,
              "node": {
                "id": @string@,
                "author": {
                    "id": @string@
                },
                "value": @string@
              }
            },
            @...@
          ]
        }
      }
    }
  }
  """
