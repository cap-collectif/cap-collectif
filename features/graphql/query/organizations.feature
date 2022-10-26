@organization
Feature: organizations

Scenario: GraphQL admin wants to get all organizations
  Given I am logged in to graphql as admin
  And I send a GraphQL POST request:
  """
  {
    "query": "{
      organizations {
        totalCount
        edges {
          node {
            title
          }
        }
      }
    }"
  }
  """
  Then the JSON response should match:
  """
  {
    "data":{
      "organizations": {
        "totalCount": 3,
        "edges": [
          {
            "node": {
              "title": "Communauté de commune de Parthenay"
            }
          },
          {
            "node": {
              "title": "GIEC"
            }
          },
          {
            "node": {
              "title": "Organisation sans members"
            }
          }
        ]
      }
    }
  }
  """

Scenario: GraphQL admin wants to search organizations
  Given I am logged in to graphql as admin
  And I send a GraphQL POST request:
  """
  {
    "query": "{
      organizations (search: \"parthenay\") {
        totalCount
        edges {
          node {
            title
          }
        }
      }
    }"
  }
  """
  Then the JSON response should match:
  """
  {
    "data":{
      "organizations": {
        "totalCount": 1,
        "edges": [
          {
            "node": {
              "title": "Communauté de commune de Parthenay"
            }
          }
        ]
      }
    }
  }
  """