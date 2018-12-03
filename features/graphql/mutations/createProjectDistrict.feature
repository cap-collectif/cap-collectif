@createProjectDistrict
Feature: Create a district in projects

@database @rabbitmq
Scenario: Admin wants to create a district in projects
  Given I am logged in to graphql as admin
  And I send a GraphQL POST request:
   """
   {
    "query": "mutation ($input: CreateProjectDistrictInput!) {
      createProjectDistrict(input: $input) {
        district {
          id
          name
          geojson
          displayedOnMap
          border {
            color
            opacity
            size
          }
          background {
            color
            opacity
          }
        }
      }
    }",
    "variables": {
      "input": {
        "name": "Mon super quartier",
        "geojson": null,
        "displayedOnMap": true,
        "border": {
          "enabled": true,
          "color": "#AADDAA",
          "opacity": 0.6,
          "size": 2
        },
        "background": {
          "enabled": true,
          "color": "#AAEEAA",
          "opacity": 0.1
        }
      }
    }
  }
  """
  Then the JSON response should match:
  """
  {
    "data": {
      "createProjectDistrict": {
          "district": {
            "id": @uuid@,
            "name": "Mon super quartier",
            "geojson": null,
            "displayedOnMap": true,
            "border": {
              "color": "#AADDAA",
              "opacity": 0.6,
              "size": 2
            },
            "background": {
              "color": "#AAEEAA",
              "opacity": 0.1
            }
          }
       }
     }
  }
  """
