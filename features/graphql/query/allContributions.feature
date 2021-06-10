@allContributions
Feature: Comment

Scenario: GraphQL admin want to get all contributions
  Given I send a GraphQL POST request:
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
      "allContributions": 1012
    }
  }
  """
