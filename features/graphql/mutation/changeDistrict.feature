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

@database
Scenario: GraphQL client wants to change district of a proposal but geojson is not even json
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
        "geojson": "{'validjson':false, 'validGeoJSON': false}}}}}"
      }
    }
  }
  """
  Then the JSON response should match:
  """
  {"errors":[{"message":"Input not valid.","extensions":{"category":"user"},"locations":[{"line":1,"column":46}],"path":["changeDistrict"]}],"data":{"changeDistrict":null}}
  """

@database
Scenario: GraphQL client wants to change district of a proposal but has invalid geojson
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
        "geojson": "{'validjson':true, 'validGeoJSON': false}"
      }
    }
  }
  """
  Then the JSON response should match:
  """
  {"errors":[{"message":"Input not valid.","extensions":{"category":"user"},"locations":[{"line":1,"column":46}],"path":["changeDistrict"]}],"data":{"changeDistrict":null}}
  """

@database
Scenario: GraphQL client wants to change district of a proposal and use a valid geoJson
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
        "geojson": "{\"type\": \"Feature\", \"properties\": { \"name\": \"a point\"}, \"geometry\": {\"type\": \"Point\", \"coordinates\": [7.2874, 48.4165]}}"
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
          "geojson": "{\"type\": \"Feature\", \"properties\": { \"name\": \"a point\"}, \"geometry\": {\"type\": \"Point\", \"coordinates\": [7.2874, 48.4165]}}"
        }
      }
    }
  }
  """
