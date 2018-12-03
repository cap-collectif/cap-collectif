@deleteProjectDistrict
Feature: Delete a district in projects

@database
Scenario: Admin wants to delete a district in projects
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
  And I send a GraphQL POST request:
  """
  {
    "query": "query {
      projectDistricts {
        id
        name
      }
    }"
  }
  """
  Then the JSON response should match:
  """
  {
   "data":{
      "projectDistricts": [
        {
          "id": "projectDistrict2",
          "name": "Deuxième Quartier"
        }
      ]
    }
  }
  """

Scenario: Admin wants to receive error during deleting a district in projects
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
