@groups @deleteGroup
Feature: deleteGroup

@database
Scenario: GraphQL client wants to delete a group
  Given I am logged in to graphql as admin
  And I send a GraphQL POST request:
  """
  {
    "query": "mutation ($input: DeleteGroupInput!) {
      deleteGroup(input: $input) {
        deletedGroupTitle
      }
    }",
    "variables": {
      "input": {
        "groupId": "group2"
      }
    }
  }
  """
  Then the JSON response should match:
  """
  {
    "data": {
      "deleteGroup": {
        "deletedGroupTitle": "Agent de la ville"
      }
    }
  }
  """
