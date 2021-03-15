@cors
Feature: CORS

@database
Scenario: Public API
  Given feature "public_api" is enabled
  And I send a public GraphQL OPTIONS request with origin "*" :
  """
  {
    "query": "{
      nodes(ids: []) {
        id
      }
    }
    "
  }
  """
  Then response header "Access-Control-Allow-Origin" contains "*"
  And response header "Access-Control-Allow-Methods" contains "OPTIONS, POST"
  And response header "Content-Security-Policy" contains "default-src 'none'"
  And I send a public GraphQL POST request with origin "*" :
  """
  {
    "query": "{
      nodes(ids: []) {
        id
      }
    }
    "
  }
  """
  Then the JSON response should match:
  """
  {
    "data": {
      "nodes": []
    }
  }
  """

@database
Scenario: Internal API
  Given I send an internal GraphQL OPTIONS request:
  """
  {
    "query": "{
      nodes(ids: []) {
        id
      }
    }
    "
  }
  """
  Then response header "Access-Control-Allow-Origin" contains "https://capco.dev"
  And response header "Access-Control-Allow-Methods" contains "OPTIONS, POST"
  And response header "Content-Security-Policy" contains "default-src 'none'"
  And I send an internal GraphQL POST request with origin "https://capco.dev" :
  """
  {
    "query": "{
      nodes(ids: []) {
        id
      }
    }
    "
  }
  """
  Then the JSON response should match:
  """
  {
    "data": {
      "nodes": []
    }
  }
  """
