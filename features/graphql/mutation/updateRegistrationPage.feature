@updateRegistrationPage
Feature: Update RegistrationPage

@database
Scenario: GraphQL admin wants to update registration page code
  Given I am logged in to graphql as admin
  And I send a GraphQL POST request:
  """
  {
    "query": "mutation UpdateRegistrationPageMutation($input: UpdateRegistrationPageInput!) {
      updateRegistrationPage(input: $input) {
        customcode
      }
    }",
    "variables": {
      "input": {
        "customcode": "<script>console.log('Bonjour');</script>"
      }
    }
  }
  """
  Then the JSON response should match:
  """
  {
    "data": {
      "updateRegistrationPage": {
        "customcode": "<script>console.log('Bonjour');</script>"
      }
    }
  }
  """
