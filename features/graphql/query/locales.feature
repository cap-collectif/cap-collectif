@locales
Feature: Locale

Scenario: GraphQL client wants to get all published locales
  And I send a GraphQL POST request:
  """
  {
    "query": "{
      locales {
        traductionKey
        code
        isEnabled
        isPublished
        isDefault
      }
    }"
  }
  """
  Then the JSON response should match:
  """
  {
    "data":{
      "locales": [
        {
          "traductionKey": "english",
          "code": "EN_GB",
          "isEnabled": true,
          "isPublished": true,
          "isDefault": false
        },
        {
          "traductionKey": "french",
          "code": "FR_FR",
          "isEnabled": true,
          "isPublished": true,
          "isDefault": true
        }
      ]
    }
  }
  """
