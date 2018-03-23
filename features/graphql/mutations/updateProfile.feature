@user
Feature: Update a user

@database
Scenario: User should be be able to update his username
  Given I am logged in to graphql as user
  And I send a GraphQL POST request:
  """
  {
    "query": "mutation ($input: UpdateProfileInput!) {
      updateProfile(input: $input) {
        viewer {
          id
          username
        }
      }
    }",
    "variables": {
      "input": {
        "username": "Nouveau username"
      }
    }
  }
  """
  Then the JSON response should match:
  """
  {
    "data": {
      "updateProfile": {
        "viewer": {
          "id": "user5",
          "username": "Nouveau username"
        }
      }
    }
  }
  """
