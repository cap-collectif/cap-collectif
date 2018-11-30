@udpateProjectDistrict
Feature: Update a district in projects

@database @rabbitmq
Scenario: Admin wants to update a district in projects
  Given I am logged in to graphql as admin
  And I send a GraphQL POST request:
   """
   {
    "query": "mutation ($input: UpdateProjectDistrictInput!) {
      updateProjectDistrict(input: $input) {
        district {
          id
          name
          geojson
          displayedOnMap
          border {
            isEnable
            color
            opacity
            size
          }
          background {
            isEnable
          }
        }
      }
    }",
    "variables": {
      "input": {
        "id": "projectDistrict1",
        "name": "Quartier à jour",
        "geojson": null,
        "displayedOnMap": true,
        "border": {
          "isEnable": true,
          "color": "#FFFFFF",
          "opacity": 0.8,
          "size": 1
        },
        "background": {
          "isEnable": false
        }
      }
    }
  }
  """
  Then the JSON response should match:
  """
  {
    "data": {
      "updateProjectDistrict": {
          "district": {
            "id": "projectDistrict1",
            "name": "Quartier à jour",
            "geojson": null,
            "displayedOnMap": true,
            "border": {
              "isEnable": true,
              "color": "#FFFFFF",
              "opacity": 0.8,
              "size": 1
            },
            "background": {
              "isEnable": false
            }
          }
        }
      }
  }
  """

@database
Scenario: Admin wants to receive error during updating a district in projects
  Given I am logged in to graphql as admin
  And I send a GraphQL POST request:
   """
   {
    "query": "mutation ($input: UpdateProjectDistrictInput!) {
      updateProjectDistrict(input: $input) {
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
        "id": "wrongDistrictId",
        "name": "Quartier à jour",
        "geojson": null,
        "displayedOnMap": true
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
          "updateProjectDistrict"
        ]
      }
    ],
    "data": {
      "updateProjectDistrict": null
    }
  }
  """
