@udpateGlobalDistrict @admin
Feature: Update a district in projects

@database
Scenario: Admin wants to update a district in projects
  Given I am logged in to graphql as admin
  And I send a GraphQL POST request:
   """
   {
    "query": "mutation ($input: UpdateGlobalDistrictInput!) {
      updateGlobalDistrict(input: $input) {
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
            description
          }
        }
      }
    }",
    "variables": {
      "input": {
        "id": "RGlzdHJpY3Q6Z2xvYmFsRGlzdHJpY3Qx",
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
          {"locale":"en-GB","name":"My new awesome district !", "titleOnMap": "Short name", "description": "Short description."}
        ]
      }
    }
  }
  """
  Then the JSON response should match:
  """
  {
     "data":{
        "updateGlobalDistrict":{
           "district":{
              "id":"RGlzdHJpY3Q6Z2xvYmFsRGlzdHJpY3Qx",
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
                    "titleOnMap":"Short name",
                    "description":"Short description."
                 },
                 {
                    "name":"Premier Quartier",
                    "locale":"fr-FR",
                    "titleOnMap":"1er",
                    "description":"Ainsi les derniers seront les premiers, et les premiers seront les derniers, car il y a beaucoup d'appelés, mais peu d'élus."
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
    "query": "mutation ($input: UpdateGlobalDistrictInput!) {
      updateGlobalDistrict(input: $input) {
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
        "id": "RGlzdHJpY3Q6Z2xvYmFsRGlzdHJpY3Qx",
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
      "updateGlobalDistrict": {
          "district": {
            "id": "RGlzdHJpY3Q6Z2xvYmFsRGlzdHJpY3Qx",
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
    "query": "mutation ($input: UpdateGlobalDistrictInput!) {
      updateGlobalDistrict(input: $input) {
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
      "updateGlobalDistrict":{
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
