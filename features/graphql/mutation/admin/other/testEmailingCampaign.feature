@emailingCampaign @admin
Feature: emailingCampaign

@database
Scenario: GraphQL admin tests a campaign
  Given I am logged in to graphql as admin
  And I send a GraphQL POST request:
  """
  {
    "query": "mutation ($input: TestEmailingCampaignInput!) {
      testEmailingCampaign(input: $input) {
        error
        html
      }
    }",
    "variables": {
      "input": {
        "email": "vincent@cap-collectif.com",
        "id": "RW1haWxpbmdDYW1wYWlnbjpDYW1wYWlnblRvQ292aWRQYXJ0aWNpcGFudHM="
      }
    }
  }
  """
  Then the JSON response should match:
  """
  {
    "data": {
      "testEmailingCampaign": {
        "error": null,
        "html": "@string@"
      }
    }
  }
  """

@database
Scenario: GraphQL project owner wants to test its campaign but not sendable
  Given I am logged in to graphql as theo
  And I send a GraphQL POST request:
  """
  {
    "query": "mutation ($input: TestEmailingCampaignInput!) {
      testEmailingCampaign(input: $input) {
        error
        html
      }
    }",
    "variables": {
      "input": {
        "email": "vincent@cap-collectif.com",
        "id": "RW1haWxpbmdDYW1wYWlnbjpDYW1wYWlnblRvUHJvamVjdFdpdGhPd25lcg=="
      }
    }
  }
  """
  Then the JSON response should match:
  """
  {
    "data": {
      "testEmailingCampaign": {
        "error": "CANNOT_BE_SENT",
        "html": null
      }
    }
  }
  """

Scenario: GraphQL project owner wants to test another one campaign
  Given I am logged in to graphql as theo
  And I send a GraphQL POST request:
  """
  {
    "query": "mutation ($input: TestEmailingCampaignInput!) {
      testEmailingCampaign(input: $input) {
        error
        html
      }
    }",
    "variables": {
      "input": {
        "email": "vincent@cap-collectif.com",
        "id": "RW1haWxpbmdDYW1wYWlnbjpDYW1wYWlnblRvQ292aWRQYXJ0aWNpcGFudHM="
      }
    }
  }
  """
  Then the JSON response should match:
  """
  {"errors":[{"message":"Access denied to this field.","@*@": "@*@"}],"data":{"testEmailingCampaign":null}}
  """


  @database
  Scenario: Organization admin tests a campaign
    Given I am logged in to graphql as VMD
    And I send a GraphQL POST request:
  """
  {
    "query": "mutation ($input: TestEmailingCampaignInput!) {
      testEmailingCampaign(input: $input) {
        error
        html
      }
    }",
    "variables": {
      "input": {
        "email": "vincent@cap-collectif.com",
        "id": "RW1haWxpbmdDYW1wYWlnbjpDYW1wYWlnblRvT3JnYW5pemF0aW9uRHJhZnQ="
      }
    }
  }
  """
    Then the JSON response should match:
  """
  {
    "data": {
      "testEmailingCampaign": {
        "error": null,
        "html": "@string@"
      }
    }
  }
  """