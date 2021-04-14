@homePageProjectsSectionAdmin
Feature: HomePageProjectsSectionAdmin


Scenario: GraphQL client wants to get a homePageProjectsSectionAdmin
  Given I am logged in to graphql as admin
  Given I send a GraphQL request:
  """
    {
      homePageProjectsSectionAdmin {
        id
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
        "homePageProjectsSectionAdmin": {
          "id": "SG9tZVBhZ2VQcm9qZWN0c1NlY3Rpb25BZG1pbjpzZWN0aW9uUHJvamVjdHM=",
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
