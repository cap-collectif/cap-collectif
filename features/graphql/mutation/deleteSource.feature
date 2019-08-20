@deleteSource
Feature: Delete a source

@database
Scenario: Author wants to delete his source
  Given I am logged in to graphql as user
  And I send a GraphQL POST request:
   """
   {
    "query": "mutation ($input: DeleteSourceInput!) {
      deleteSource(input: $input) {
        sourceable {
          id
        }
        deletedSourceId
      }
    }",
    "variables": {
      "input": {
        "sourceId": "source1"
      }
    }
  }
  """
  Then the JSON response should match:
  """
  {
    "data": {
      "deleteSource": {
          "deletedSourceId": "source1",
          "sourceable": {
              "id": "opinion3"
          }
       }
     }
  }
  """

@security
Scenario: User wants to delete an source but is not the author
  Given I am logged in to graphql as pierre
  And I send a GraphQL POST request:
   """
   {
    "query": "mutation ($input: DeleteSourceInput!) {
      deleteSource(input: $input) {
        sourceable {
          id
        }
        deletedSourceId
      }
    }",
    "variables": {
      "input": {
        "sourceId": "source1"
      }
    }
  }
  """
  Then the JSON response should match:
  """
  {"errors":[{"message":"You are not the author of source with id: source1","@*@": "@*@"}],"data":{"deleteSource":null}}
  """

@security
Scenario: User wants to delete an source without requirements
  Given I am logged in to graphql as jean
  And I send a GraphQL POST request:
   """
   {
    "query": "mutation ($input: DeleteSourceInput!) {
      deleteSource(input: $input) {
        sourceable {
          id
        }
        deletedSourceId
      }
    }",
    "variables": {
      "input": {
        "sourceId": "source41"
      }
    }
  }
  """
  Then the JSON response should match:
  """
  {"errors":[{"message":"You dont meets all the requirements.","@*@": "@*@"}],"data":{"deleteSource":null}}
  """
