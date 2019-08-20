@changeArgument
Feature: Change Argument

@database @rabbitmq
Scenario: Author wants to update his argument
  Given I am logged in to graphql as user
  And I send a GraphQL POST request:
   """
   {
    "query": "mutation ($input: ChangeArgumentInput!) {
      changeArgument(input: $input) {
        argument {
          id
          body
          updatedAt
        }
      }
    }",
    "variables": {
      "input": {
        "argumentId": "argument1",
        "body": "New Tololo"
      }
    }
  }
  """
  Then the JSON response should match:
  """
  {
    "data": {
      "changeArgument": {
          "argument": {
              "id": "argument1",
              "body": "New Tololo",
              "updatedAt": "@string@.isDateTime()"
          }
       }
     }
  }
  """
  Then the queue associated to "argument_update" producer has messages below:
  | 0 | {"argumentId": "argument1"} |

@security
Scenario: User wants to update an argument but is not the author
  Given I am logged in to graphql as pierre
  And I send a GraphQL POST request:
   """
   {
    "query": "mutation ($input: ChangeArgumentInput!) {
      changeArgument(input: $input) {
        argument {
          id
        }
      }
    }",
    "variables": {
      "input": {
        "argumentId": "argument1",
        "body": "New Tololo"
      }
    }
  }
  """
  Then the JSON response should match:
  """
  {"errors":[{"message":"Can\u0027t update the argument of someone else.","@*@": "@*@"}],"data":{"changeArgument":null}}
  """
