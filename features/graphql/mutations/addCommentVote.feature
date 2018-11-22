@addCommentVote
Feature: mutation addCommentVote

@database
Scenario: Logged in API client wants to vote for a comment
  Given I am logged in to graphql as user
  And I send a GraphQL POST request:
  """
  {
    "query": "mutation ($input: AddCommentVoteInput!) {
      addCommentVote(input: $input) {
        voteEdge {
            node {
                id
                published
                contribution {
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
        "commentId": "eventComment1"
      }
    }
  }
  """
  Then the JSON response should match:
  """
  {
    "data": {
      "addCommentVote": {
        "voteEdge": {
            "node": {
                "id": @string@,
                "published": true,
                "contribution": {
                    "id": "eventComment1"
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