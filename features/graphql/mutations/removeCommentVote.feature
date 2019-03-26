@removeCommentVote
Feature: mutation removeCommentVote

@database
Scenario: Logged in API client wants to remove a vote for an comment
  Given I am logged in to graphql as lbrunet
  And I send a GraphQL POST request:
  """
  {
    "query": "mutation ($input: RemoveCommentVoteInput!) {
      removeCommentVote(input: $input) {
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
        "commentId": "eventComment1"
      }
    }
  }
  """
  Then the JSON response should match:
  """
{
   "data":{
      "removeCommentVote":{
         "contribution":{
            "id":"eventComment1",
            "votes":{
               "totalCount":2
            }
         },
         "deletedVoteId":"Q29tbWVudFZvdGU6NTAwNzg="
      }
   }
}
  """
