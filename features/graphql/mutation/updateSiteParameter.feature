@siteParameter @admin
Feature: siteParameter

Scenario: GraphQL admin wants to add a bad email as reception email
  Given I am logged in to graphql as admin
  And I send a GraphQL POST request:
  """
  {
    "query": "mutation ($input: UpdateSiteParameterInput!) {
      updateSiteParameter(input: $input) {
        errorCode
        siteParameter {
          keyname
          value
        }
      }
    }",
    "variables": {
      "input": {
        "keyname": "RECEIVE_ADDRESS",
        "value": "jenesuispasunmail"
      }
    }
  }
  """
  Then the JSON response should match:
  """
  {
    "data": {
      "updateSiteParameter": {
        "errorCode": "INVALID_VALUE",
        "siteParameter": null
      }
    }
  }
  """

@database
Scenario: GraphQL admin adds a new email as reception email
  Given I am logged in to graphql as admin
  And I send a GraphQL POST request:
  """
  {
    "query": "mutation ($input: UpdateSiteParameterInput!) {
      updateSiteParameter(input: $input) {
        errorCode
        siteParameter {
          keyname
          value
        }
      }
    }",
    "variables": {
      "input": {
        "keyname": "RECEIVE_ADDRESS",
        "value": "receipt@mail.fr"
      }
    }
  }
  """
  Then the JSON response should match:
  """
  {
    "data": {
      "updateSiteParameter": {
        "errorCode": null,
        "siteParameter": {
          "keyname": "admin.mail.notifications.receive_address",
          "value": "receipt@mail.fr"
        }
      }
    }
  }
  """

@database
Scenario: GraphQL admin update sender name
  Given I am logged in to graphql as admin
  And I send a GraphQL POST request:
  """
  {
    "query": "mutation ($input: UpdateSiteParameterInput!) {
      updateSiteParameter(input: $input) {
        errorCode
        siteParameter {
          keyname
          value
        }
      }
    }",
    "variables": {
      "input": {
        "keyname": "SEND_NAME",
        "value": "envoyeur"
      }
    }
  }
  """
  Then the JSON response should match:
  """
  {
    "data": {
      "updateSiteParameter": {
        "errorCode": null,
        "siteParameter": {
          "keyname": "admin.mail.notifications.send_name",
          "value": "envoyeur"
        }
      }
    }
  }
  """
