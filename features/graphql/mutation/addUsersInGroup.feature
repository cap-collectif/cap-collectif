@groups @addUsersInGroup @admin
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
        "groupId": "R3JvdXA6Z3JvdXAy",
        "users": [
          "VXNlcjp1c2VyMTAx"
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
          "id": "R3JvdXA6Z3JvdXAy",
          "users": {
              "edges": [
                {
                  "node": {
                    "id": "VXNlcjp1c2VyMTAx"
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
        "groupId": "R3JvdXA6Z3JvdXAy",
        "users": [
          "VXNlcjp1c2VyMTAx",
          "VXNlcjp1c2VyMTA3"
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
          "id": "R3JvdXA6Z3JvdXAy",
          "users": {
            "edges": [
              {
                "node": {
                  "id": "VXNlcjp1c2VyMTAx"
                }
              },
              {
                "node": {
                  "id": "VXNlcjp1c2VyMTA3"
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
