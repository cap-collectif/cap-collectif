@addArgument
Feature: Add Argument

@database
Scenario: User wants to add an argument on an opinion
  Given I am logged in to graphql as user
  And I send a GraphQL POST request:
   """
   {
    "query": "mutation ($input: AddArgumentInput!) {
      addArgument(input: $input) {
        argument {
          id
          body
          type
          author {
            id
          }
        }
      }
    }",
    "variables": {
      "input": {
        "argumentableId": "opinion57",
        "body": "Tololo",
        "type": "FOR"
      }
    }
  }
  """
  Then the JSON response should match:
  """
  {
    "data": {
      "addArgument": {
          "argument": {
              "id": @uuid@,
              "body": "Tololo",
              "type": "FOR",
              "author": {
                "id": "user5"
              }
          }
       }
     }
  }
  """
  Then the queue associated to "argument_create" producer has messages below:
  | 0 | {"argumentId": "@uuid@"} |

@security
Scenario: User wants to add an argument on an uncontibuable opinion
  Given I am logged in to graphql as user
  And I send a GraphQL POST request:
   """
   {
    "query": "mutation ($input: AddArgumentInput!) {
      addArgument(input: $input) {
        argument {
          id
        }
      }
    }",
    "variables": {
      "input": {
        "argumentableId": "opinion63",
        "body": "Tololo",
        "type": "FOR"
      }
    }
  }
  """
  Then the JSON response should match:
  """
  {"errors":[{"message":"Can\u0027t add an argument to an uncontributable argumentable.","locations":[{"line":1,"column":42}],"path":["addArgument"]}],"data":{"addArgument":null}}
  """

# @security @database
# Scenario: User can't add more than 2 arguments in a minute
#   Given I am logged in to api as user
#   And I send a valid addArgument GraphQL POST request
#   And I send a valid addArgument GraphQL POST request
#   And I send a valid addArgument GraphQL POST request
#   And the JSON response should match:
#   """
#   {
#     "data": @null@,
#     "errors": {
#       "message": "You contributed too many times."
#     }
#   }
#   """
