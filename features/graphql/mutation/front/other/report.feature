@comments @other
Feature: Comments

@database
Scenario: Admin GraphQL client wants to report a idea
  Given I am logged in to graphql as admin
  And I send a GraphQL POST request:
  """
  {
    "query": "mutation ToggleFeatureMutation($input: ReportInput!) {
      report(input: $input) {
        report {
          body
          type
        }
      }
    }",
    "variables": {
      "input": {
        "reportableId": "Q29tbWVudDpwcm9wb3NhbENvbW1lbnQx",
        "body": "je suis un spammeur",
        "type": "SPAM"
      }
    }
  }
  """
  Then the JSON response should match:
  """
  {
    "data": {
      "report": {
        "report": {
          "body": "je suis un spammeur",
          "type": "SPAM"
        }
      }
    }
  }
  """

@security
Scenario: Anonymous GraphQL client wants to report a idea
  Given I am logged out
  And I send a GraphQL POST request:
  """
  {
    "query": "mutation ToggleFeatureMutation($input: ReportInput!) {
      report(input: $input) {
        report {
          body
          type
        }
      }
    }",
    "variables": {
      "input": {
        "reportableId": "Q29tbWVudDpwcm9wb3NhbENvbW1lbnQx",
        "body": "je suis un spammeur",
        "type": "SPAM"
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
      "report": null
    }
  }
  """
