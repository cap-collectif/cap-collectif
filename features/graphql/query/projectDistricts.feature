@projectDistrict
Feature: Project Districts list

Scenario: GraphQL client wants to list project district
  Given I am logged in to graphql as admin
  And I send a GraphQL POST request:
  """
  {
    "query": "query {
      projectDistricts {
        id
        name
      }
    }"
  }
  """
  Then the JSON response should match:
  """
  {
   "data":{
      "projectDistricts": [
        {
          "id": "projectDistrict2",
          "name": "Deuxième Quartier"
        },
        {
          "id": "projectDistrict1",
          "name": "Premier Quartier"
        }
      ]
    }
  }
  """
