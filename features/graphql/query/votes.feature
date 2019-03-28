@votes
Feature: Votes

@read-only
Scenario: GraphQL admin want to get all votes
  Given I am logged in to graphql as admin
  And I send a GraphQL POST request:
  """
  {
    "query": "{
      votes(first: 5) {
        totalCount
      }
    }
    "
  }
  """
  Then the JSON response should match:
  """
  {
    "data": {
      "votes": {
        "totalCount": 249
      }
    }
  }
  """
