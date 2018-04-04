@groups @deleteUserInGroup
Feature: deleteUserInGroup

@database
Scenario: GraphQL client wants to remove a user from group
  Given I am logged in to graphql as admin
  And I send a GraphQL POST request:
  """
  {
    "query": "mutation ($input: DeleteUserInGroupInput!) {
      deleteUserInGroup(input: $input) {
        group {
          id
          usersConnection {
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
          "userId": "user1"
        }
      }
  }
  """
  Then the JSON response should match:
  """
  {
      "data": {
        "deleteUserInGroup": {
          "group": {
            "id": "group2",
            "usersConnection": {
              "edges": [
              {
                "node": {
                  "id": "user503"
                }
              }
              ]
            }
          }
        }
      }
  }
  """
