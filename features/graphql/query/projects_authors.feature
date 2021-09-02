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
          {"username":"lbrunet"},
          {"username":"sfavot"},
          {"username":"xlacot"},
          {"username":"admin"},
          {"username":"welcomattic"},
          {"username":"spyl"},
          {"username":"Jpec"},
          {"username":"Vince"},
          {"username":"Th\u00e9o QP"}
        ]
      }
    }
  """
