@delete_account
Feature: Delete user contributions

@database
Scenario: User who decide to soft delete his account should have his contents anonymized but not deleted. His personnal datas should be deleted.
  Given I am logged in to graphql as user
  And I send a GraphQL POST request:
  """
  {
    "query": "mutation ($input: DeleteAccountInput!) {
      deleteAccount(input: $input) {
        userId
      }
    }",
    "variables": {
      "input": {
        "type": "SOFT"
      }
    }
  }
  """
  Then the JSON response should match:
  """
  {
    "data": {
      "deleteAccount": {
         "userId": "VXNlcjp1c2VyNQ=="
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
    "query": "mutation ($input: DeleteAccountInput!) {
      deleteAccount(input: $input) {
        userId
      }
    }",
    "variables": {
      "input": {
        "type": "HARD"
      }
    }
  }
  """
  Then the JSON response should match:
  """
  {
    "data": {
      "deleteAccount": {
         "userId": "VXNlcjp1c2VyNQ=="
      }
    }
  }
  """
