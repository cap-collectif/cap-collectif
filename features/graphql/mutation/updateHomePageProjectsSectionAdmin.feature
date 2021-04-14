@updateHomePageProjectsSectionAdmin
Feature: updateHomePageProjectsSectionAdmin

Scenario: GraphQL client wants to update a homePageProjectsSectionAdmin
  Given I am logged in to graphql as admin
  And I send a GraphQL POST request:
  """
  {
    "query": "mutation ($input: UpdateHomePageProjectsSectionAdminInput!) {
      updateHomePageProjectsSectionAdmin(input: $input) {
        errorCode
        homePageProjectsSectionAdmin {
          title
          teaser
          position
          displayMode
          nbObjects
          enabled
        }
      }
    }",
    "variables": {
      "input": {
        "position": 3,
        "displayMode": "MOST_RECENT",
        "nbObjects": 2,
        "enabled": true,
        "translations": [
          {
            "locale": "fr-FR",
            "title": "titre",
            "teaser": "sous titre"
          }
        ]
     }
    }
  }
  """
    Then the JSON response should match:
  """
  {
    "data": {
      "updateHomePageProjectsSectionAdmin": {
        "errorCode": null,
        "homePageProjectsSectionAdmin": {
          "title": "titre",
          "teaser": "sous titre",
          "position": 3,
          "displayMode": "MOST_RECENT",
          "nbObjects": 2,
          "enabled": true
        }
      }
    }
  }
  """


