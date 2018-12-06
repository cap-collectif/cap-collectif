@projectDistrict
Feature: Project Districts list

Scenario: GraphQL client wants to list project district
  Given I am logged in to graphql as admin
  And I send a GraphQL POST request:
  """
  {
    "query": "query {
      projectDistricts {
        edges {
          node {
            id
            name
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
      "projectDistricts": {
        "edges": [
          {
            "node": {
              "id": "projectDistrict2",
              "name": "Deuxième Quartier"
            }
          },
          {
            "node": {
              "id": "projectDistrict1",
              "name": "Premier Quartier"
            }
          }
        ]
      }
    }
  }
  """
