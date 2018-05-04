@delete_user_contributions
Feature: Delete user contributions

@database
Scenario: User who decide to soft delete his account should have his contents anonymized but not deleted. His personnal datas should be deleted.
  Given I am logged in to graphql as user
  And I send a GraphQL POST request:
  """
  {
    "query": "mutation ($input: DeleteUserContributionsInput!) {
      deleteUserContributions(input: $input) {
        userId
        username
        contributionsRemoved
        contributionsContentDeleted
      }
    }",
    "variables": {
      "input": {
        "removal": "soft"
      }
    }
  }
  """
  Then the JSON response should match:
  """
  {
    "data": {
      "deleteUserContributions": {
         "userId": "user5",
         "username": "deleted-user",
         "contributionsRemoved": 0,
         "contributionsContentDeleted": 0
      }
    }
  }
  """

@database
Scenario: User who decide to hard delete his account should have his contents anonymized and deleted. His personnal datas should be deleted too.
  Given I am logged in to graphql as user
  And I send a GraphQL POST request:
  """
  {
    "query": "mutation ($input: DeleteUserContributionsInput!) {
      deleteUserContributions(input: $input) {
        userId
        username
        contributionsRemoved
        contributionsContentDeleted
      }
    }",
    "variables": {
      "input": {
        "removal": "hard"
      }
    }
  }
  """
  Then the JSON response should match:
  """
  {
    "data": {
      "deleteUserContributions": {
         "userId": "user5",
         "username": "deleted-user",
         "contributionsRemoved": 39,
         "contributionsContentDeleted": 14
      }
    }
  }
  """
