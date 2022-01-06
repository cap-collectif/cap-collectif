@updateGroup @admin
Feature: updateGroup

@database
Scenario: GraphQL client wants to update a group
  Given I am logged in to graphql as admin
  And I send a GraphQL POST request:
  """
  {
    "query": "mutation ($input: UpdateGroupInput!) {
      updateGroup(input: $input) {
        group {
          id
          title
          description
        }
      }
    }",
    "variables": {
      "input": {
        "groupId": "R3JvdXA6Z3JvdXAy",
        "title": "Nouveau titre",
        "description": "Nouvelle description"
      }
    }
  }
  """
  Then the JSON response should match:
  """
  {
    "data": {
      "updateGroup": {
        "group": {
          "id": "R3JvdXA6Z3JvdXAy",
          "title": "Nouveau titre",
          "description": "Nouvelle description"
        }
      }
    }
  }
  """
