Feature: Project

@database
Scenario: GraphQL client wants to get list of users groups who can access to current project
  Given I am logged in to graphql as pierre
  And I send a GraphQL POST request:
  """
  {
    "query": "query getAllowedGroups ($projectId: ID!,$count: Int, $cursor: String){
      project: node(id: $projectId) {
        ... on Project {
          restrictedViewers(first: $count, after: $cursor) {
            edges {
              cursor
              node {
                id
                title
              }
            }
            totalCount
            totalUserCount
          }
        }
      }
    }",
    "variables": {
      "projectId": "UHJvamVjdDpQcm9qZWN0V2l0aEN1c3RvbUFjY2Vzcw==",
      "count": 32,
      "cursor": null
    }
  }
  """
  Then the JSON response should match:
  """
  {
    "data": {
      "project": {
        "restrictedViewers": {
          "edges": [
            {
              "cursor": @string@,
              "node": {
                "id": "group2",
                "title": @string@
              }
            },{
              "cursor": @string@,
              "node": {
                "id": "group3",
                "title": @string@
              }
            }
          ],
          "totalCount": 2,
          "totalUserCount": 13
        }
      }
    }
  }
  """
