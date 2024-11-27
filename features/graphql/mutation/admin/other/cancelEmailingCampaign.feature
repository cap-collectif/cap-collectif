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
          "sendAt": @date@,
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
  {"errors":[{"message":"Access denied to this field.","@*@": "@*@"}],"data":{"cancelEmailingCampaign":null}}
  """

@database
Scenario: Organization admin cancel a planned campaign
  Given I am logged in to graphql as VMD
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
      "id": "RW1haWxpbmdDYW1wYWlnbjpDYW1wYWlnblRvT3JnYW5pemF0aW9uUGxhbm5lZA=="
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
        "sendAt": null,
        "status": "DRAFT",
        "preview": @string@
      }
    }
  }
}
"""