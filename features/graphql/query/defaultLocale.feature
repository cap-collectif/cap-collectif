@defaultLocale
Feature: Locale

Scenario: GraphQL client wants to get the default locale
  Given I send a GraphQL POST request:
  """
  {
    "query": "{
      defaultLocale {
        code,
        traductionKey,
        isEnabled,
        isPublished,
        isDefault
      }
    }"
  }
  """
  Then the JSON response should match:
  """
  {
    "data": {
      "defaultLocale": {
        "code": "FR_FR",
        "traductionKey": "french",
        "isEnabled": true,
        "isPublished": true,
        "isDefault": true
      }
    }
  }
  """
