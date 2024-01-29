@deleteGlobalDistrict @delete
Feature: Delete a district in projects

@database
Scenario: Admin can delete a project district
  Given I am logged in to graphql as admin
  And I send a GraphQL POST request:
   """
   {
    "query": "mutation ($input: DeleteGlobalDistrictInput!) {
      deleteGlobalDistrict(input: $input) {
        deletedDistrictId
      }
    }",
    "variables": {
      "input": {
        "id": "RGlzdHJpY3Q6Z2xvYmFsRGlzdHJpY3Qx"
      }
    }
  }
  """
  Then the JSON response should match:
  """
  {
    "data": {
      "deleteGlobalDistrict": {
          "deletedDistrictId": "RGlzdHJpY3Q6Z2xvYmFsRGlzdHJpY3Qx"
       }
     }
  }
  """

Scenario: Admin should receive an error when deleting an unknown project district
  Given I am logged in to graphql as admin
  And I send a GraphQL POST request:
   """
   {
    "query": "mutation ($input: DeleteGlobalDistrictInput!) {
      deleteGlobalDistrict(input: $input) {
        deletedDistrictId
        userErrors {
          message
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
   "data":{  
      "deleteGlobalDistrict":{
         "deletedDistrictId":null,
         "userErrors":[  
            {  
              "message":"Unknown project district with id: wrongDistrictId"
            }
         ]
      }
   }
  }
  """
