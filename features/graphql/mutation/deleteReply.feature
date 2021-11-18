@deleteReply @reply
Feature: Delete reply

@database
Scenario: User can delete his reply
  Given I am logged in to graphql as admin
  And I send a GraphQL POST request:
  """
  {
    "query": "mutation ($input: DeleteUserReplyInput!) {
      deleteUserReply(input: $input) {
        questionnaire {
          id
        }
        replyId
      }
    }",
    "variables": {
      "input": {
        "id": "UmVwbHk6cmVwbHk1"
      }
    }
  }
  """
  Then the JSON response should match:
  """
  {"data":{"deleteUserReply":{"questionnaire": {"id": "UXVlc3Rpb25uYWlyZTpxdWVzdGlvbm5haXJlMQ=="} ,"replyId": "UmVwbHk6cmVwbHk1"}}}
  """

@security
Scenario: User can not delete the reply of someone else
  Given I am logged in to graphql as user
  And I send a GraphQL POST request:
  """
  {
    "query": "mutation ($input: DeleteUserReplyInput!) {
      deleteUserReply(input: $input) {
        questionnaire {
          id
        }
      }
    }",
    "variables": {
      "input": {
        "id": "UmVwbHk6cmVwbHky"
      }
    }
  }
  """
  Then the JSON response should match:
  """
  {
    "errors": [
      {"message":"You are not the author of this reply","@*@": "@*@"}
    ],
    "data": {
      "deleteUserReply": null
    }
  }
  """
