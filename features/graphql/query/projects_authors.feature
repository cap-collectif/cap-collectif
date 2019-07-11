@projects @read-only
Feature: Projects

Scenario: GraphQL client wants to list projects authors
  Given I send a GraphQL POST request:
  """
  {
    "query": "{
        projectAuthors {
          username
        }
    }"
  }
  """
  Then the JSON response should match:
  """
    {
      "data":{
        "projectAuthors":[
          {"username":"admin"},
          {"username":"xlacot"},
          {"username":"welcomattic"},
          {"username":"sfavot"},
          {"username":"lbrunet"}
        ]
      }
    }
  """