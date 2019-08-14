@deleteComment
Feature: Delete a comment

@database
Scenario: Author wants to delete his comment
  Given I am logged in to graphql as user
  And I send a GraphQL POST request:
   """
   {
    "query": "mutation ($input: DeleteCommentInput!) {
      deleteComment(input: $input) {
        deletedCommentId
        userErrors {
          message
        }
      }
    }",
    "variables": {
      "input": {
        "id": "Q29tbWVudDpldmVudENvbW1lbnQx"
      }
    }
  }
  """
  Then the JSON response should match:
  """
  {
    "data": {
      "deleteComment": {
          "deletedCommentId": "Q29tbWVudDpldmVudENvbW1lbnQx",
          "userErrors": []
       }
     }
  }
  """

@security
Scenario: User wants to delete a comment but is not the author
  Given I am logged in to graphql as pierre
  And I send a GraphQL POST request:
   """
   {
    "query": "mutation ($input: DeleteCommentInput!) {
      deleteComment(input: $input) {
        deletedCommentId
        userErrors {
          message
        }
      }
    }",
    "variables": {
      "input": {
        "id": "Q29tbWVudDpldmVudENvbW1lbnQx"
      }
    }
  }
  """
  Then the JSON response should match:
  """
  {"data":{"deleteComment":{"deletedCommentId":null,"userErrors":[{"message":"You are not author of the comment."}]}}}
  """
