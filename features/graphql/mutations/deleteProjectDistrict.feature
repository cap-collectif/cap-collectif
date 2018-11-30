@deleteProjectDistrict
Feature: Delete a district in projects

@database
Scenario: Admin wants to delete a district in projects
  Given I am logged in to graphql as admin
  And I send a GraphQL POST request:
   """
   {
    "query": "mutation ($input: DeleteProjectDistrictInput!) {
      deleteProjectDistrict(input: $input) {
        district {
          id
          name
          geojson
          displayedOnMap
        }
      }
    }",
    "variables": {
      "input": {
        "id": "projectDistrict1"
      }
    }
  }
  """
  Then the JSON response should match:
  """
  {
    "data": {
      "deleteProjectDistrict": {
          "district": {
            "id": "projectDistrict1",
            "name": "Premier Quartier",
            "geojson": null,
            "displayedOnMap": true
          }
       }
     }
  }
  """
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
        }
      ]
    }
  }
  """

Scenario: Admin wants to receive error during deleting a district in projects
  Given I am logged in to graphql as admin
  And I send a GraphQL POST request:
   """
   {
    "query": "mutation ($input: DeleteProjectDistrictInput!) {
      deleteProjectDistrict(input: $input) {
        district {
          id
          name
          geojson
          displayedOnMap
        }
      }
    }",
    "variables": {
      "input": {
        "id": "wrongDistrictId"
      }
    }
  }
  """
  Then the JSON response should match:
  """
  {
    "errors": [
      {
        "message": "Unknown project district with id: wrongDistrictId",
        "category": "user",
        "locations": [
          {
            "line": 1,
            "column": 52
          }
        ],
        "path": [
          "deleteProjectDistrict"
        ]
      }
    ],
    "data": {
      "deleteProjectDistrict": null
    }
  }
  """
