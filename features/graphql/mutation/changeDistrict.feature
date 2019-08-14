@changeDistrict
Feature: changeDistrict

@database
Scenario: GraphQL client wants to change district of a proposal
  Given I am logged in to graphql as admin
  And I send a GraphQL POST request:
  """
  {
    "query": "mutation ($input: ChangeDistrictInput!) {
      changeDistrict(input: $input) {
        district {
          name
          displayedOnMap
          geojson
        }
      }
    }",
    "variables": {
      "input": {
        "name": "New name",
        "displayedOnMap": false,
        "districtId": "district1",
        "geojson": null
      }
    }
  }
  """
  Then the JSON response should match:
  """
  {
    "data": {
      "changeDistrict": {
        "district": {
          "name": "New name",
          "displayedOnMap": false,
          "geojson": null
        }
      }
    }
  }
  """
