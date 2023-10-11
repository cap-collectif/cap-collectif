@addArgumentVote @add
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
        "argumentId": "QXJndW1lbnQ6YXJndW1lbnQx"
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
                    "id": "QXJndW1lbnQ6YXJndW1lbnQx"
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
        "argumentId": "QXJndW1lbnQ6YXJndW1lbnQxMDE="
      }
    }
  }
  """
  Then the JSON response should match:
  """
  {"errors":[{"message":"Uncontribuable argument.","@*@": "@*@"}],"data":{"addArgumentVote":null}}
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
        "argumentId": "QXJndW1lbnQ6YXJndW1lbnQyMDE="
      }
    }
  }
  """
  Then the JSON response should match:
  """
  { "errors":[{
      "message":"Uncontribuable argument.",
      "@*@": "@*@"
    }],
    "data":{"addArgumentVote":null}
  }
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
        "argumentId": "QXJndW1lbnQ6YXJndW1lbnQyNTE="
      }
    }
  }
  """
  Then the JSON response should match:
  """
    {"errors":[{"message":"You dont meets all the requirements.","@*@": "@*@"}],"data":{"addArgumentVote":null}}
  """
