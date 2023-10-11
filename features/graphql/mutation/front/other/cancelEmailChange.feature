@cancelEmailChange @other
Feature: cancelEmailChange

@database
Scenario: User successfully cancel email change
  Given I am logged in to graphql as user
  And I send a GraphQL POST request:
  """
  {
    "query": "mutation {
      cancelEmailChange {
        success
      }
    }"
  }
  """
  Then the JSON response should match:
  """
  {
    "data": {
      "cancelEmailChange": {
        "success": true
      }
    }
  }
  """
  