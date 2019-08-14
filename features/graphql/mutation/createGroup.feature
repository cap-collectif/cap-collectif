@createGroup
Feature: createGroup

@database
Scenario: GraphQL client wants to create a group
  Given I am logged in to graphql as admin
  And I send a GraphQL POST request:
  """
  {
    "query": "mutation ($input: CreateGroupInput!) {
      createGroup(input: $input) {
        group {
          id
          title
        }
      }
    }",
    "variables": {
      "input": {
        "title": "Nouveau groupe"
      }
    }
  }
  """
  Then the JSON response should match:
  """
  {
    "data": {
      "createGroup": {
        "group": {
          "id": @string@,
          "title": "Nouveau groupe"
        }
      }
    }
  }
  """
