@deleteProjectDistrict
Feature: Delete a district in projects

@database
Scenario: Admin can delete a project district
  Given I am logged in to graphql as admin
  And I send a GraphQL POST request:
   """
   {
    "query": "mutation ($input: DeleteProjectDistrictInput!) {
      deleteProjectDistrict(input: $input) {
        deletedDistrictId
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
          "deletedDistrictId": "projectDistrict1"
       }
     }
  }
  """

Scenario: Admin should receive an error when deleting an unknown project district
  Given I am logged in to graphql as admin
  And I send a GraphQL POST request:
   """
   {
    "query": "mutation ($input: DeleteProjectDistrictInput!) {
      deleteProjectDistrict(input: $input) {
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
      "deleteProjectDistrict":{  
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
