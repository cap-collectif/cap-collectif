@updateLocaleStatus
Feature: updateLocaleStatus

@database
Scenario: GraphQL client wants to update status of two locales
  Given I am logged in to graphql as admin
  And I send a GraphQL POST request:
  """
  {
    "query": "mutation ($input: UpdateLocaleStatusInput!) {
      updateLocaleStatus(input: $input) {
        locales {
          edges {
            node {
              id
              isEnabled
              isPublished
              isDefault
            }
          }
        }
      }
    }",
    "variables": {
      "input": {
        "locales": [
          {"id": "locale-de-DE", "isEnabled": true, "isPublished": true},
          {"id": "locale-es-ES", "isEnabled": true}
        ]
      }
    }
  }
  """
  Then the JSON response should match:
  """
  {
    "data":{
      "updateLocaleStatus":{
        "locales":{
          "edges":[
            {
              "node":{
                "id":"locale-de-DE",
                "isEnabled":true,
                "isPublished":true,
                "isDefault":false
              }
            },
            {
              "node":{
                "id":"locale-es-ES",
                "isEnabled":true,
                "isPublished":false,
                "isDefault":false
              }
            }
          ]
        }
      }
    }
  }
  """

@database
Scenario: GraphQL client wants to publish a disabled language and get error
  Given I am logged in to graphql as admin
  And I send a GraphQL POST request:
  """
  {
    "query": "mutation ($input: UpdateLocaleStatusInput!) {
      updateLocaleStatus(input: $input) {
        locales {
          edges {
            node {
              id
              isEnabled
              isPublished
              isDefault
            }
          }
        }
      }
    }",
    "variables": {
      "input": {
        "locales": [
          {"id": "locale-de-DE", "isEnabled": false, "isPublished": true}
        ]
      }
    }
  }
  """
  Then the JSON response should match:
  """
  {
    "errors": [
      {
        "message": "Locale configuration error",
        "extensions": {"category": "user"},
        "locations": [{"line": 1, "column": 50}],
        "path": ["updateLocaleStatus"]
      }
    ],
    "data": {
      "updateLocaleStatus": null
    }
  }
  """
