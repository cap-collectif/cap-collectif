@udpateProjectDistrict @admin
Feature: Update a district in projects

@database
Scenario: Admin wants to update a district in projects
  Given I am logged in to graphql as admin
  And I send a GraphQL POST request:
   """
   {
    "query": "mutation ($input: UpdateProjectDistrictInput!) {
      updateProjectDistrict(input: $input) {
        district {
          id
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
          translations {
            name
            locale
            titleOnMap
          }
        }
      }
    }",
    "variables": {
      "input": {
        "id": "RGlzdHJpY3Q6cHJvamVjdERpc3RyaWN0MQ==",
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
        },
        "translations":[
          {"locale":"en-GB","name":"My new awesome district !", "titleOnMap": "Short name"}
        ]
      }
    }
  }
  """
  Then the JSON response should match:
  """
  {
     "data":{
        "updateProjectDistrict":{
           "district":{
              "id":"RGlzdHJpY3Q6cHJvamVjdERpc3RyaWN0MQ==",
              "geojson":null,
              "displayedOnMap":true,
              "border":{
                 "enabled":true,
                 "color":"#FFFFFF",
                 "opacity":0.8,
                 "size":1
              },
              "background":{
                 "enabled":false
              },
              "translations":[
                 {
                    "name":"My new awesome district !",
                    "locale":"en-GB",
                    "titleOnMap":"Short name"
                 },
                 {
                    "name":"Premier Quartier",
                    "locale":"fr-FR",
                    "titleOnMap":"1er"
                 }
              ]
           }
        }
     }
  }
  """

@database
Scenario: Admin wants to update a district with another translation
  Given I am logged in to graphql as admin
  And I send a GraphQL POST request:
   """
   {
    "query": "mutation ($input: UpdateProjectDistrictInput!) {
      updateProjectDistrict(input: $input) {
        district {
          id
          translations {
            name
            locale
          }
        }
      }
    }",
    "variables": {
      "input": {
        "id": "RGlzdHJpY3Q6cHJvamVjdERpc3RyaWN0MQ==",
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
        },
        "translations":[
          {"locale":"en-GB","name":"My new awesome district !"},
          {"locale":"fr-FR","name":"Mon super quartier !"}
        ]
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
            "id": "RGlzdHJpY3Q6cHJvamVjdERpc3RyaWN0MQ==",
            "translations":[
              {"locale":"en-GB","name":"My new awesome district !"},
              {"locale":"fr-FR","name":"Mon super quartier !"}
            ]
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
        }
        userErrors {
          message
        }
      }
    }",
    "variables": {
      "input": {
        "id": "wrongDistrictId",
        "translations":[
          {"locale":"fr-FR","name":"Quartier à jour"}
        ]
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
