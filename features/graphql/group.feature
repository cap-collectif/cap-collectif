@group
Feature: Groups

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
          "id": @string@
        }
      }
    }
  }
  """

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
          "id": "group2"
        }
      }
    }
  }
  """

@database
Scenario: GraphQL client wants to delete a group
  Given I am logged in to graphql as admin
  And I send a GraphQL POST request:
  """
  {
    "query": "mutation ($input: DeleteGroupInput!) {
      deleteGroup(input: $input) {
        group {
          title
        }
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
        "group": {
          "title": "Agent de la ville"
        }
      }
    }
  }
  """

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
          "id": "group2"
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
          "id": "group2"
        }
      }
    }
  }
  """

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
          "id": "group2"
        }
      }
    }
  }
  """
