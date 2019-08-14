@addArgument
Feature: Add Argument

@database @rabbitmq
Scenario: User wants to add an argument on an opinion
  Given I am logged in to graphql as user
  And I send a GraphQL POST request:
   """
   {
    "query": "mutation ($input: AddArgumentInput!) {
      addArgument(input: $input) {
        argument {
          id
          published
          body
          type
          author {
            _id
          }
        }
        argumentEdge {
          cursor
          node {
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
              "id": @string@,
              "published": true,
              "body": "Tololo",
              "type": "FOR",
              "author": {
                "_id": "user5"
              }
          },
          "argumentEdge": {
              "cursor": "YXJyYXljb25uZWN0aW9uOjA=",
              "node": {
                "id": @string@
              }
          }
       }
     }
  }
  """
  Then the queue associated to "argument_create" producer has messages below:
  | 0 | {"argumentId": "@uuid@"} |

@database @rabbitmq
Scenario: User wants to add an argument on an opinion without requirements
  Given I am logged in to graphql as jean
  And I send a GraphQL POST request:
   """
   {
    "query": "mutation ($input: AddArgumentInput!) {
      addArgument(input: $input) {
        argument {
          id
        }
        userErrors {
          message
        }
      }
    }",
    "variables": {
      "input": {
        "argumentableId": "opinion1",
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
        "argument": null,
        "userErrors": [{"message":"You dont meets all the requirements."}]
      }
    }
  }
  """

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
        userErrors {
          message
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
  {
    "data": {
      "addArgument": {
        "argument": null,
        "userErrors": [{"message":"Can\u0027t add an argument to an uncontribuable argumentable."}]
      }
    }
  }
  """

@security @database
Scenario: User can't add more than 2 arguments in a minute
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
        "argumentableId": "opinion57",
        "body": "Tololo",
        "type": "FOR"
      }
    }
  }
  """
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
        "argumentableId": "opinion57",
        "body": "Tololo",
        "type": "FOR"
      }
    }
  }
  """
  And I send a GraphQL POST request:
   """
   {
    "query": "mutation ($input: AddArgumentInput!) {
      addArgument(input: $input) {
        argument {
          id
        }
        userErrors {
          message
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
  And the JSON response should match:
  """
   {
     "data":{
       "addArgument":{
         "argument":null,
         "userErrors":[{"message":"You contributed too many times."}]
         }
      }
    }
  """
