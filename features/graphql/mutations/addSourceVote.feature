@addSourceVote
Feature: mutation addSourceVote

@database
Scenario: Logged in API client wants to vote for a source
  Given I am logged in to graphql as user
  And I send a GraphQL POST request:
  """
  {
    "query": "mutation ($input: AddSourceVoteInput!) {
      addSourceVote(input: $input) {
        voteEdge {
            node {
                id
                published
            }
        }
      }
    }",
    "variables": {
      "input": {
        "sourceId": "source42"
      }
    }
  }
  """
  Then the JSON response should match:
  """
  {
    "data":{
      "addSourceVote": {
        "voteEdge": {
          "node": {
            "id":@string@,
            "published":true
          }
        }
      }
    }
  }
  """

Scenario: Logged in API client wants to vote for a source
  Given I am logged in to graphql as jean
  And I send a GraphQL POST request:
  """
  {
    "query": "mutation ($input: AddSourceVoteInput!) {
      addSourceVote(input: $input) {
        voteEdge {
            node {
                id
                published
            }
        }
      }
    }",
    "variables": {
      "input": {
        "sourceId": "source42"
      }
    }
  }
  """
  Then the JSON response should match:
  """
  {
    "errors":[{
      "message":"You dont meets all the requirements.",
      "category":"user",
      "locations":[{"line":1,"column":45}],
      "path":["addSourceVote"]
    }],
    "data":{"addSourceVote":null}
  }
  """
