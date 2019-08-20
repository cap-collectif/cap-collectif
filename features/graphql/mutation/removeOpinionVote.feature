@removeOpinionVote
Feature: mutation removeOpinionVote

@security
Scenario: Logged in API client wants to remove a vote in a not contribuable opinion
  Given I am logged in to graphql as user
  And I send a GraphQL POST request:
  """
  {
    "query": "mutation ($input: RemoveOpinionVoteInput!) {
      removeOpinionVote(input: $input) {
        contribution {
          id
        }
      }
    }",
    "variables": {
      "input": {
        "opinionId": "opinion63"
      }
    }
  }
  """
  Then the JSON response should match:
  """
  {
    "errors":[{"message":"Uncontribuable opinion.","@*@": "@*@"}],
    "data":{"removeOpinionVote":null}
  }
  """

@security
Scenario: Logged in API client wants to remove a vote but has not voted
  Given I am logged in to graphql as user
  And I send a GraphQL POST request:
  """
  {
    "query": "mutation ($input: RemoveOpinionVoteInput!) {
      removeOpinionVote(input: $input) {
        contribution {
          id
        }
      }
    }",
    "variables": {
      "input": {
        "opinionId": "opinion58"
      }
    }
  }
  """
  Then the JSON response should match:
  """
  {
    "errors": [
      {
        "message": "You have not voted for this opinion.",
        "@*@": "@*@"
      }
    ],
    "data": {
      "removeOpinionVote": null
    }
  }
  """

@database
Scenario: Logged in API client wants to remove a vote
  Given I am logged in to graphql as admin
  And I send a GraphQL POST request:
  """
  {
    "query": "mutation ($input: RemoveOpinionVoteInput!) {
      removeOpinionVote(input: $input) {
        contribution {
          id
        }
        deletedVoteId
      }
    }",
    "variables": {
      "input": {
        "opinionId": "opinion57"
      }
    }
  }
  """
  Then the JSON response should match:
  """
  {
    "data": {
      "removeOpinionVote": {
        "contribution": {
          "id": "opinion57"
        },
        "deletedVoteId": "T3BpbmlvblZvdGU6NA=="
      }
    }
  }
  """

@database
Scenario: Logged in API client wants to remove a vote without meeting requirements
  Given I am logged in to graphql as jean
  And I send a GraphQL POST request:
  """
  {
    "query": "mutation ($input: RemoveOpinionVoteInput!) {
      removeOpinionVote(input: $input) {
        contribution {
          id
        }
        deletedVoteId
      }
    }",
    "variables": {
      "input": {
        "opinionId": "opinion1"
      }
    }
  }
  """
  Then the JSON response should match:
  """
  {
  "errors":[
    {
      "message":"You dont meets all the requirements.",
      "@*@": "@*@"
    }
  ],
  "data":{"removeOpinionVote":null}
  }
  """
