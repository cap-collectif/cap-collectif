@addArgumentVote
Feature: mutation addArgumentVote

@database
Scenario: Logged in API client wants to vote for an argument
  Given I am logged in to graphql as user
  And I send a GraphQL POST request:
  """
  {
    "query": "mutation ($input: AddArgumentVoteInput!) {
      addArgumentVote(input: $input) {
        voteEdge {
            node {
                id
                published
                related {
                    id
                }
                author {
                    _id
                }
            }
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
      "addArgumentVote": {
        "voteEdge": {
            "node": {
                "id": @string@,
                "published": true,
                "related": {
                    "id": "argument1"
                },
                "author": {
                    "_id": "user5"
                }
            }
        }
      }
    }
  }
  """

@security
Scenario: Logged in API client can not vote for a trashed argument
  Given I am logged in to graphql as user
  And I send a GraphQL POST request:
  """
  {
    "query": "mutation ($input: AddArgumentVoteInput!) {
      addArgumentVote(input: $input) {
        voteEdge {
            node {
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
      }
    }",
    "variables": {
      "input": {
        "argumentId": "argument101"
      }
    }
  }
  """
  Then the JSON response should match:
  """
  {"errors":[{"message":"Uncontribuable argument.","category":"user","locations":[{"line":1,"column":47}],"path":["addArgumentVote"]}],"data":{"addArgumentVote":null}}
  """

@security
Scenario: Logged in API client can not vote for a argument in a closed step
  Given I am logged in to graphql as user
  And I send a GraphQL POST request:
  """
  {
    "query": "mutation ($input: AddArgumentVoteInput!) {
      addArgumentVote(input: $input) {
        voteEdge {
            node {
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
      }
    }",
    "variables": {
      "input": {
        "argumentId": "argument201"
      }
    }
  }
  """
  Then the JSON response should match:
  """
  {"errors":[{"message":"Uncontribuable argument.","category":"user","locations":[{"line":1,"column":47}],"path":["addArgumentVote"]}],"data":{"addArgumentVote":null}}
  """

@database
Scenario: Logged in API client wants to vote for an argument without requirements
  Given I am logged in to graphql as jean
  And I send a GraphQL POST request:
  """
  {
    "query": "mutation ($input: AddArgumentVoteInput!) {
      addArgumentVote(input: $input) {
        voteEdge {
            node {
                id
                published
                related {
                    id
                }
                author {
                    _id
                }
            }
        }
      }
    }",
    "variables": {
      "input": {
        "argumentId": "argument251"
      }
    }
  }
  """
  Then the JSON response should match:
  """
    {"errors":[{"message":"You dont meets all the requirements.","category":"user","locations":[{"line":1,"column":47}],"path":["addArgumentVote"]}],"data":{"addArgumentVote":null}}
  """
