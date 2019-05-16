@allContributions
Feature: Comment

Scenario: GraphQL admin want to get users including superadmin
  Given I am logged in to graphql as admin
  And I send a GraphQL POST request:
  """
  {
    "query": "{
      allContributions
    }
    "
  }
  """
  Then the JSON response should match:
  """
  {
    "data": {
      "allContributions": 436
    }
  }
  """
