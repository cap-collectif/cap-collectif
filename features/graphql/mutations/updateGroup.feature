@updateGroup
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
        "groupId": "group2",
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
          "id": "group2",
          "title": "Nouveau titre",
          "description": "Nouvelle description"
        }
      }
    }
  }
  """
