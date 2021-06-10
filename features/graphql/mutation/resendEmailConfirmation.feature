@resendEmailConfirmation
Feature: resendEmailConfirmation

@database
Scenario: User not confirmed successfully resend email confirmation
  Given I am logged in to graphql as user_not_confirmed
  And I send a GraphQL POST request:
  """
  {
    "query": "mutation {
      resendEmailConfirmation {
        errorCode
      }
    }"
  }
  """
  Then the JSON response should match:
  """
  {
    "data": {
      "resendEmailConfirmation": {
        "errorCode": null
      }
    }
  }
  """

@database
Scenario: User not confirmed receive EMAIL_RECENTLY_SENT error when attempting to re-send emails too quickly
  Given I am logged in to graphql as user_not_confirmed
  And I send a GraphQL POST request:
  """
  {
    "query": "mutation {
      resendEmailConfirmation {
        errorCode
      }
    }"
  }
  """
  And I send a GraphQL POST request:
  """
  {
    "query": "mutation {
      resendEmailConfirmation {
        errorCode
      }
    }"
  }
  """
  Then the JSON response should match:
  """
  {
    "data": {
      "resendEmailConfirmation": {
        "errorCode": "EMAIL_RECENTLY_SENT"
      }
    }
  }
  """

@database
Scenario: User receive EMAIL_ALREADY_CONFIRMED error when he is already confirmed
  Given I am logged in to graphql as user
  And I send a GraphQL POST request:
  """
  {
    "query": "mutation {
      resendEmailConfirmation {
        errorCode
      }
    }"
  }
  """
  Then the JSON response should match:
  """
  {
    "data": {
      "resendEmailConfirmation": {
        "errorCode": "EMAIL_ALREADY_CONFIRMED"
      }
    }
  }
  """
