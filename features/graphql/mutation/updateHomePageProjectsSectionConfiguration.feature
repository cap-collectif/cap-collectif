@updateHomePageProjectsSectionConfiguration
Feature: updateHomePageProjectsSectionConfiguration

@database
Scenario: GraphQL client wants to update a HomePageProjectsSectionConfiguration with MOST_RECENT displayMode
  Given I am logged in to graphql as admin
  And I send a GraphQL POST request:
    """
    {
      "query": "mutation ($input: UpdateHomePageProjectsSectionConfigurationInput!) {
        updateHomePageProjectsSectionConfiguration(input: $input) {
          errorCode
          homePageProjectsSectionConfiguration {
            title
            teaser
            position
            displayMode
            nbObjects
            enabled
            projects {
              edges {
                node {
                  title
                }
              }
            }
          }
        }
      }",
      "variables": {
        "input": {
          "position": 3,
          "displayMode": "MOST_RECENT",
          "nbObjects": 2,
          "enabled": true,
          "projects": [],
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
        "updateHomePageProjectsSectionConfiguration": {
          "errorCode": null,
          "homePageProjectsSectionConfiguration": {
            "title": "titre",
            "teaser": "sous titre",
            "position": 3,
            "displayMode": "MOST_RECENT",
            "nbObjects": 2,
            "enabled": true,
            "projects": {
              "edges": []
            }
          }
        }
      }
    }
    """

@database
Scenario: GraphQL client wants to update a HomePageProjectsSectionConfiguration with CUSTOM displayMode
  Given I am logged in to graphql as admin
  And I send a GraphQL POST request:
    """
    {
      "query": "mutation ($input: UpdateHomePageProjectsSectionConfigurationInput!) {
        updateHomePageProjectsSectionConfiguration(input: $input) {
          errorCode
          homePageProjectsSectionConfiguration {
            title
            teaser
            position
            displayMode
            nbObjects
            enabled
            projects {
              edges {
                node {
                  title
                }
              }
            }
          }
        }
      }",
      "variables": {
        "input": {
          "position": 3,
          "displayMode": "CUSTOM",
          "nbObjects": 2,
          "enabled": true,
          "projects": [
            "UHJvamVjdDpwcm9qZWN0Rm9vZA==",
            "UHJvamVjdDpwcm9qZWN0Q29uZmluZW1lbnQ=",
            "UHJvamVjdDpwcm9qZWN0V3lzaXd5Zw=="
          ],
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
        "updateHomePageProjectsSectionConfiguration": {
          "errorCode": null,
          "homePageProjectsSectionConfiguration": {
            "title": "titre",
            "teaser": "sous titre",
            "position": 3,
            "displayMode": "CUSTOM",
            "nbObjects": 2,
            "enabled": true,
            "projects": {
              "edges": [
                {
                  "node": {
                    "title": "Food project"
                  }
                },
                {
                  "node": {
                    "title": "Débat du mois"
                  }
                },
                {
                  "node": {
                    "title": "Débat Wysiwyg"
                  }
                }
              ]
            }
          }
        }
      }
    }
    """
