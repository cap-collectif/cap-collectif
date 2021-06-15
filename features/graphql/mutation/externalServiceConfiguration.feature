@externalServiceConfiguration @admin
Feature: Update external service configuration

Scenario: Admin wants to update configuration but provides invalid value
  Given I am logged in to graphql as admin
  And I send a GraphQL POST request:
  """
  {
    "query": "mutation ($input: UpdateExternalServiceConfigurationInput!) {
      updateExternalServiceConfiguration(input: $input) {
        externalServiceConfiguration {
          value
        }
        error
      }
    }",
    "variables": {
      "input": {
        "type": "MAILER",
        "value": "invalid"
      }
    }
  }
  """
  Then the JSON response should match:
  """
  {
    "data": {
      "updateExternalServiceConfiguration": {
        "externalServiceConfiguration": {
          "value": "mandrill"
        },
        "error": "INVALID_VALUE"
      }
    }
  }
  """

@database
Scenario: Admin updates configuration
  Given I am logged in to graphql as admin
  And I send a GraphQL POST request:
  """
  {
    "query": "mutation ($input: UpdateExternalServiceConfigurationInput!) {
      updateExternalServiceConfiguration(input: $input) {
        externalServiceConfiguration {
          value
        }
        error
      }
    }",
    "variables": {
      "input": {
        "type": "MAILER",
        "value": "mailjet"
      }
    }
  }
  """
  Then the JSON response should match:
  """
  {
    "data": {
      "updateExternalServiceConfiguration": {
        "externalServiceConfiguration": {
          "value": "mailjet"
        },
        "error": null
      }
    }
  }
  """
