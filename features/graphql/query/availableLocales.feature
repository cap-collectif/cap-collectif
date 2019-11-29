@availableLocales
Feature: Locale

Scenario: GraphQL admin client wants to get all locales
  Given I am logged in to graphql as admin
  And I send a GraphQL POST request:
  """
  {
    "query": "{
      availableLocales {
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
      "availableLocales": [
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

Scenario: GraphQL admin client wants to get all locales, including the disabled ones
  Given I am logged in to graphql as admin
  And I send a GraphQL POST request:
  """
  {
    "query": "{
      availableLocales(includeDisabled: true) {
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
      "availableLocales": [
        {
          "traductionKey": "deutsch",
          "code": "DE_DE",
          "isEnabled": false,
          "isPublished": false,
          "isDefault": false
        },
        {
          "traductionKey": "english",
          "code": "EN_GB",
          "isEnabled": true,
          "isPublished": true,
          "isDefault": false
        },
        {
          "traductionKey": "spanish",
          "code": "ES_ES",
          "isEnabled": false,
          "isPublished": false,
          "isDefault": false
        },
        {
          "traductionKey": "french",
          "code": "FR_FR",
          "isEnabled": true,
          "isPublished": true,
          "isDefault": true
        },
        {
          "traductionKey": "dutchman",
          "code": "NL_NL",
          "isEnabled": false,
          "isPublished": false,
          "isDefault": false
        }
      ]
    }
  }
  """
