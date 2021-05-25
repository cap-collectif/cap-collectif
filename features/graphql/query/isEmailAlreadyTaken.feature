@core @user @email
Feature: IsEmailAlreadyTaken

Scenario: GraphQL client wants to check that an email is free to use
  Given I send a GraphQL POST request:
  """
  {
    "query": "query isEmailAlreadyTaken($email: Email!) {
      isEmailAlreadyTaken(email: $email)
    }",
    "variables": {
      "email": "notused@test.com"
    }
  }
  """
  Then the JSON response should match:
  """
  {
    "data": {
      "isEmailAlreadyTaken": false
    }
  }
  """

Scenario: Agui find out its email is already taken
  Given I send a GraphQL POST request:
  """
  {
    "query": "query isEmailAlreadyTaken($email: Email!) {
      isEmailAlreadyTaken(email: $email)
    }",
    "variables": {
      "email": "julien.aguilar@cap-collectif.com"
    }
  }
  """
  Then the JSON response should match:
  """
  {
    "data": {
      "isEmailAlreadyTaken": true
    }
  }
  """
