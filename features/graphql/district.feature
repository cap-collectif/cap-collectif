@district
Feature: District

@database
Scenario: GraphQL client wants to trash a proposal
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

Scenario: GraphQL client wants to get list of available districts for a particular location
  Given I send a GraphQL POST request:
  """
  {
    "query": "availableDistrictsForLocalisation ($proposalFormId: ID!, $latitude: Float!, $longitude: Float!) {
      name
    }",
    "variables": {
      "proposalFormId": "proposalForm1",
      "latitude": 48.1159675,
      "longitude": -1.7234738
    }
  }
  """
  Then the JSON response should match:
  """
  {
    "data": {
      "availableDistrictsForLocalisation": [
        {
          "name": "La Touche"
        }
      ]
    }
  }
  """
