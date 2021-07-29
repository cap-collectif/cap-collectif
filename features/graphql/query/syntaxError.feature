@syntaxError
Feature: Syntax error

Scenario: GraphQL client sends a correct request
  Given I send a GraphQL POST request:
  """
  {
    "query": "{
      registrationScript
    }
    "
  }
  """
  Then the GraphQL response status code should be 200

Scenario: GraphQL client sends a malformed request
  Given I send a GraphQL POST request without throwing:
  """
  {
    "query": "'{
      registrationScript
    }
    "
  }
  """
  Then the GraphQL response status code should be 400
