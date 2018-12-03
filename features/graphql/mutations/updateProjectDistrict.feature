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
            enabled
            color
            opacity
            size
          }
          background {
            enabled
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
          "enabled": true,
          "color": "#FFFFFF",
          "opacity": 0.8,
          "size": 1
        },
        "background": {
          "enabled": false
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
              "enabled": true,
              "color": "#FFFFFF",
              "opacity": 0.8,
              "size": 1
            },
            "background": {
              "enabled": false
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
        userErrors {
          message
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
   "data":{  
      "updateProjectDistrict":{  
         "district":null,
         "userErrors":[  
            {  
              "message":"Unknown project district with id: wrongDistrictId"
            }
         ]
      }
   }
  }
  """
