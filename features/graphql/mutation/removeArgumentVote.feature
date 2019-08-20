@removeArgumentVote
Feature: mutation removeArgumentVote

@database
Scenario: Logged in API client wants to remove a vote for an argument
  Given I am logged in to graphql as lbrunet
  And I send a GraphQL POST request:
  """
  {
    "query": "mutation ($input: RemoveArgumentVoteInput!) {
      removeArgumentVote(input: $input) {
        contribution {
          id
          votes(first: 0) {
            totalCount
          }
        }
        deletedVoteId
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
      "removeArgumentVote": {
        "contribution": {
          "id": "argument1",
          "votes": {
            "totalCount": 2
          }
        },
        "deletedVoteId": "QXJndW1lbnRWb3RlOjUwMDE="
      }
    }
  }
  """
  
@security
Scenario: Logged in API client wants to remove a vote but has not voted
  Given I am logged in to graphql as user
  And I send a GraphQL POST request:
  """
  {
    "query": "mutation ($input: RemoveArgumentVoteInput!) {
      removeArgumentVote(input: $input) {
        contribution {
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
    "errors": [
      {
        "message": "You have not voted for this argument.",
        "@*@": "@*@"
      }
    ],
    "data": {
      "removeArgumentVote": null
    }
  }
  """ 

@security
Scenario: Logged in API client wants to remove a vote without requirements
  Given I am logged in to graphql as jean
  And I send a GraphQL POST request:
  """
  {
    "query": "mutation ($input: RemoveArgumentVoteInput!) {
      removeArgumentVote(input: $input) {
        contribution {
          id
        }
      }
    }",
    "variables": {
      "input": {
        "argumentId": "argument252"
      }
    }
  }
  """
  Then the JSON response should match:
  """
  {
    "errors": [
      {
        "message": "You dont meets all the requirements.",
        "@*@": "@*@"
      }
    ],
    "data": {
      "removeArgumentVote": null
    }
  }
  """
