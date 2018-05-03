@requestUserArchive
Feature: requestUserArchive

@database
Scenario: GraphQL client wants to request his personal archive
  Given I am logged in to graphql as admin
  And I send a GraphQL POST request:
  """
  {
    "query": "mutation {
      requestUserArchive(input: {}) {
        viewer {
          id
          archives {
            id
            requestedAt
            isGenerated
          }
        }
      }
    }"
  }
  """
  Then the JSON response should match:
  """
  {
    "data": {
      "requestUserArchive": {
        "viewer": {
          "id": "userAdmin",
          "archives": [
            {
              "id": @string@,
              "requestedAt": "@string@.isDateTime()",
              "isGenerated": false
            },
            @...@
          ]
        }
      }
    }
  }
  """
