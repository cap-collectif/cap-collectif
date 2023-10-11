@deleteUserIdentificationCodeList @userIdentificationCode @delete
Feature: deleteUserIdentificationCodeList

Scenario: API client wants to delete a list but is not admin
  Given I am logged in to graphql as theo
  And I send a GraphQL POST request:
  """
  {
    "query": "mutation ($input: DeleteUserIdentificationCodeListInput!) {
      deleteUserIdentificationCodeList(input: $input) {
        deletedUserIdentificationCodeListId
        errorCode
      }
    }",
    "variables": {
      "input": {
        "id": "VXNlcklkZW50aWZpY2F0aW9uQ29kZUxpc3Q6bmV3TGlzdA=="
      }
    }
  }
  """
  Then the JSON response should match:
  """
  {
    "errors": [
      {"message":"Access denied to this field.","@*@": "@*@"}
    ],
    "data": {
      "deleteUserIdentificationCodeList": null
    }
  }
  """

Scenario: API admin wants to delete a list but wrong id
  Given I am logged in to graphql as admin
  And I send a GraphQL POST request:
  """
  {
    "query": "mutation ($input: DeleteUserIdentificationCodeListInput!) {
      deleteUserIdentificationCodeList(input: $input) {
        deletedUserIdentificationCodeListId
        errorCode
      }
    }",
    "variables": {
      "input": {
        "id": "test"
      }
    }
  }
  """
  Then the JSON response should match:
  """
  {
    "data": {
      "deleteUserIdentificationCodeList": {
        "deletedUserIdentificationCodeListId": null,
        "errorCode": "NOT_FOUND"
      }
    }
  }
  """

@database
Scenario: API admin wants to delete a list
  Given I am logged in to graphql as admin
  And I send a GraphQL POST request:
  """
  {
    "query": "mutation ($input: DeleteUserIdentificationCodeListInput!) {
      deleteUserIdentificationCodeList(input: $input) {
        deletedUserIdentificationCodeListId
        errorCode
      }
    }",
    "variables": {
      "input": {
        "id": "VXNlcklkZW50aWZpY2F0aW9uQ29kZUxpc3Q6bmV3TGlzdA=="
      }
    }
  }
  """
  Then the JSON response should match:
  """
  {
    "data": {
      "deleteUserIdentificationCodeList": {
        "deletedUserIdentificationCodeListId": "VXNlcklkZW50aWZpY2F0aW9uQ29kZUxpc3Q6bmV3TGlzdA==",
        "errorCode": null
      }
    }
  }
  """