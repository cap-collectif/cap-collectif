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
          "id": "group2",
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
        "groupId": "group2",
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
          "id": "group2",
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
