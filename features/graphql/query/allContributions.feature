@allContributions
Feature: Comment

Scenario: GraphQL admin want to get users including superadmin
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
      "allContributions": 615
    }
  }
  """
