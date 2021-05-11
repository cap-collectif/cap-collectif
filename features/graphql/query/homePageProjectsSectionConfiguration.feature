@homePageProjectsSectionConfiguration
Feature: HomePageProjectsSectionConfiguration

Scenario: GraphQL client wants to get a HomePageProjectsSectionConfiguration when displayMode is MOST_RECENT
  Given I send a GraphQL request:
  """
    {
      homePageProjectsSectionConfiguration {
        title
        position
        teaser
        displayMode
        enabled
        nbObjects
      }
    }
  """
  Then the JSON response should match:
  """
    {
      "data": {
        "homePageProjectsSectionConfiguration": {
          "title": "Projets participatifs",
          "position": 4,
          "teaser": "Maître corbeau, sur un arbre perché, | Tenait en son bec un fromage.",
          "displayMode": "MOST_RECENT",
          "enabled": true,
          "nbObjects": 4
        }
      }
    }
  """

@database
Scenario: GraphQL client wants to get a HomePageProjectsSectionConfiguration when displayMode is CUSTOM
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
  Given I am logged out
  Given I send a GraphQL request:
  """
    {
      homePageProjectsSectionConfiguration {
        projects {
          edges {
            node {
              title
            }
          }
        }
      }
    }
  """
  Then the JSON response should match:
  """
    {
      "data": {
        "homePageProjectsSectionConfiguration": {
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
  """
