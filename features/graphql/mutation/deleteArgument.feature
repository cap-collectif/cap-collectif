@deleteArgument
Feature: Delete an argument

@database
Scenario: Author wants to delete his argument
  Given I am logged in to graphql as user
  And I send a GraphQL POST request:
   """
   {
    "query": "mutation ($input: DeleteArgumentInput!) {
      deleteArgument(input: $input) {
        argumentable {
          id
        }
      }
    }",
    "variables": {
      "input": {
        "argumentId": "argument1"
      }
    }
  }
  """
  Then the JSON response should match:
  """
  {
    "data": {
      "deleteArgument": {
          "argumentable": {
              "id": "opinion2"
          }
       }
     }
  }
  """

@security
Scenario: User wants to delete an argument but is not the author
  Given I am logged in to graphql as pierre
  And I send a GraphQL POST request:
   """
   {
    "query": "mutation ($input: DeleteArgumentInput!) {
      deleteArgument(input: $input) {
        argumentable {
          id
        }
      }
    }",
    "variables": {
      "input": {
        "argumentId": "argument1"
      }
    }
  }
  """
  Then the JSON response should match:
  """
  {"errors":[{"message":"You are not the author of argument with id: argument1","category":"user","locations":[@...@],"path":["deleteArgument"]}],"data":{"deleteArgument":null}}
  """
