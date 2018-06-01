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
          isArchiveDeleted
          isArchiveReady
          firstArchive
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
          "isArchiveDeleted": false,
          "isArchiveReady": false,
          "firstArchive": false
        }
      }
    }
  }
  """
  # TODO tester qu'on a bien le message dans la file d'attente
