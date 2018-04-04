@groups @addUsersInGroup
Feature: addUsersInGroup

@database
Scenario: GraphQL client wants to add a user in group
  Given I am logged in to graphql as admin
  And I send a GraphQL POST request:
  """
  {
    "query": "mutation ($input: AddUsersInGroupInput!) {
      addUsersInGroup(input: $input) {
        group {
          id
          users {
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
      "input": {
        "groupId": "group2",
        "users": [
          "user101"
        ]
      }
    }
  }
  """
  Then the JSON response should match:
  """
  {
    "data": {
      "addUsersInGroup": {
        "group": {
          "id": "group2",
          "users": {
              "edges": [
                {
                  "node": {
                    "id": "user101"
                  }
                },
                @...@
             ]
          }
        }
      }
    }
  }
  """

@database
Scenario: GraphQL client wants to add multiple users in group
  Given I am logged in to graphql as admin
  And I send a GraphQL POST request:
  """
  {
    "query": "mutation ($input: AddUsersInGroupInput!) {
      addUsersInGroup(input: $input) {
        group {
          id
          users {
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
      "input": {
        "groupId": "group2",
        "users": [
          "user101",
          "user107"
        ]
      }
    }
  }
  """
  Then the JSON response should match:
  """
  {
    "data": {
      "addUsersInGroup": {
        "group": {
          "id": "group2",
          "users": {
            "edges": [
              {
                "node": {
                  "id": "user101"
                }
              },
              {
                "node": {
                  "id": "user107"
                }
              },
              @...@
            ]
          }
        }
      }
    }
  }
  """
