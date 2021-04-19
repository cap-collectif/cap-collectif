@updateHomePageProjectsSectionAdmin
Feature: updateHomePageProjectsSectionAdmin

Scenario: GraphQL client wants to update a homePageProjectsSectionAdmin with MOST_RECENT displayMode
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
            sectionProjects {
              position
              project {
                title
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
          "sectionProjects": [],
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
            "enabled": true,
            "sectionProjects": []
          }
        }
      }
    }
    """

Scenario: GraphQL client wants to update a homePageProjectsSectionAdmin with CUSTOM displayMode
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
            sectionProjects {
              position
              project {
                title
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
          "sectionProjects": [
            {
              "section": "SG9tZVBhZ2VQcm9qZWN0c1NlY3Rpb25BZG1pbjpzZWN0aW9uUHJvamVjdHM=",
              "project": "UHJvamVjdDpwcm9qZWN0Rm9vZA==",
              "position": 0
            },
            {
              "section": "SG9tZVBhZ2VQcm9qZWN0c1NlY3Rpb25BZG1pbjpzZWN0aW9uUHJvamVjdHM=",
              "project": "UHJvamVjdDpwcm9qZWN0Q29uZmluZW1lbnQ=",
              "position": 1
            },
            {
              "section": "SG9tZVBhZ2VQcm9qZWN0c1NlY3Rpb25BZG1pbjpzZWN0aW9uUHJvamVjdHM=",
              "project": "UHJvamVjdDpwcm9qZWN0V3lzaXd5Zw==",
              "position": 2
            }
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
        "updateHomePageProjectsSectionAdmin": {
          "errorCode": null,
          "homePageProjectsSectionAdmin": {
            "title": "titre",
            "teaser": "sous titre",
            "position": 3,
            "displayMode": "MOST_RECENT",
            "nbObjects": 2,
            "enabled": true,
            "sectionProjects": [
              {
                "position": 0,
                "project": {
                  "title": "Food project"
                }
              },
              {
                "position": 1,
                "project": {
                  "title": "Débat du mois"
                }
              },
              {
                "position": 2,
                "project": {
                  "title": "Débat Wysiwyg"
                }
              }
            ]
          }
        }
      }
    }
    """
