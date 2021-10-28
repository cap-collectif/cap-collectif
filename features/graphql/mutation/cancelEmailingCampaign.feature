@emailingCampaign @admin
Feature: emailingCampaign

@database
Scenario: GraphQL admin cancel a planned campaign
  Given I am logged in to graphql as admin
  And I send a GraphQL POST request:
  """
  {
    "query": "mutation ($input: CancelEmailingCampaignInput!) {
      cancelEmailingCampaign(input: $input) {
        error
        emailingCampaign {
          sendAt
          status
          preview
        }
      }
    }",
    "variables": {
      "input": {
        "id": "RW1haWxpbmdDYW1wYWlnbjpDYW1wYWlnblRvVGhhbmtzUmVnaXN0ZXJlZA=="
      }
    }
  }
  """
  Then the JSON response should match:
  """
  {
    "data": {
      "cancelEmailingCampaign": {
        "error": null,
        "emailingCampaign": {
          "sendAt": "2021-01-01 00:00:00",
          "status": "DRAFT",
          "preview": @string@
        }
      }
    }
  }
  """

Scenario: GraphQL project owner wants to cancel its campaign, but it is not planned
  Given I am logged in to graphql as theo
  And I send a GraphQL POST request:
  """
  {
    "query": "mutation ($input: CancelEmailingCampaignInput!) {
      cancelEmailingCampaign(input: $input) {
        error
        emailingCampaign {
          status
        }
      }
    }",
    "variables": {
      "input": {
        "id": "RW1haWxpbmdDYW1wYWlnbjpDYW1wYWlnblRvUHJvamVjdFdpdGhPd25lcg=="
      }
    }
  }
  """
  Then the JSON response should match:
  """
  {
    "data": {
      "cancelEmailingCampaign": {
        "error": "CANNOT_BE_CANCELED",
        "emailingCampaign": null
      }
    }
  }
  """

Scenario: GraphQL project owner wants to cancel another one campaign
  Given I am logged in to graphql as theo
  And I send a GraphQL POST request:
  """
  {
    "query": "mutation ($input: CancelEmailingCampaignInput!) {
      cancelEmailingCampaign(input: $input) {
        error
        emailingCampaign {
          status
        }
      }
    }",
    "variables": {
      "input": {
        "id": "RW1haWxpbmdDYW1wYWlnbjpDYW1wYWlnblRvVGhhbmtzUmVnaXN0ZXJlZA=="
      }
    }
  }
  """
  Then the JSON response should match:
  """
  {
    "data": {
      "cancelEmailingCampaign": {
        "error": "ID_NOT_FOUND",
        "emailingCampaign": null
      }
    }
  }
  """