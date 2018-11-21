@addOpinionVote
Feature: mutation addOpinionVote

@database
Scenario: Logged in API client wants to vote for an opinion
  Given I am logged in to graphql as user
  And I send a GraphQL POST request:
  """
  {
    "query": "mutation ($input: AddOpinionVoteInput!) {
      addOpinionVote(input: $input) {
        vote {
          id
          published
          related {
            id
          }
          author {
            id
          }
        }
      }
    }",
    "variables": {
      "input": {
        "opinionId": "opinion57",
        "value": "YES"
      }
    }
  }
  """
  Then the JSON response should match:
  """
  {
    "data": {
      "addOpinionVote": {
        "vote": {
          "id": @string@,
          "published": true,
          "related": {
            "id": "opinion57"
          },
          "author": {
            "id": "user5"
          }
        }
      }
    }
  }
  """

@security
Scenario: Logged in API client wants to vote for an opinion not contributable
  Given I am logged in to graphql as user
  And I send a GraphQL POST request:
  """
  {
    "query": "mutation ($input: AddOpinionVoteInput!) {
      addOpinionVote(input: $input) {
        vote {
          id
        }
      }
    }",
    "variables": {
      "input": {
        "opinionId": "opinion63",
        "value": "YES"
      }
    }
  }
  """
  Then the JSON response should match:
  """
  {
    "errors": [
      {"message":"Uncontribuable opinion.","category":"user","locations":[{"line":1,"column":46}],"path":["addOpinionVote"]}
    ],
    "data":{"addOpinionVote":null}
  }
  """

@database
Scenario: Logged in API client wants to update an existing vote
  Given I am logged in to graphql as admin
  And I send a GraphQL POST request:
  """
  {
    "query": "mutation ($input: AddOpinionVoteInput!) {
      addOpinionVote(input: $input) {
        vote {
          id
        }
        previousVoteId
      }
    }",
    "variables": {
      "input": {
        "opinionId": "opinion57",
        "value": "NO"
      }
    }
  }
  """
  Then the JSON response should match:
  """
  {
    "data": {
      "addOpinionVote": {
        "vote": {
          "id": @string@
        },
        "previousVoteId": "T3BpbmlvblZvdGU6NA=="
      }
    }
  }
  """
