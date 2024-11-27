@emailingCampaign @admin
Feature: emailingCampaign

@database
Scenario: GraphQL admin send a draft campaign
  Given I am logged in to graphql as admin
  And I send a GraphQL POST request:
  """
  {
    "query": "mutation ($input: SendEmailingCampaignInput!) {
      sendEmailingCampaign(input: $input) {
        error
        emailingCampaign {
          status
        }
      }
    }",
    "variables": {
      "input": {
        "id": "RW1haWxpbmdDYW1wYWlnbjpDYW1wYWlnblRvQ292aWRQYXJ0aWNpcGFudHM="
      }
    }
  }
  """
  Then the JSON response should match:
  """
  {
    "data": {
      "sendEmailingCampaign": {
        "error": null,
        "emailingCampaign": {
          "status": "SENT"
        }
      }
    }
  }
  """

@database
Scenario: GraphQL admin plans a draft campaign
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
  And I send a GraphQL POST request:
  """
  {
    "query": "mutation ($input: SendEmailingCampaignInput!) {
      sendEmailingCampaign(input: $input) {
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
      "sendEmailingCampaign": {
        "error": null,
        "emailingCampaign": {
          "sendAt": @date@,
          "status": "PLANNED",
          "preview": @string@
        }
      }
    }
  }
  """

Scenario: GraphQL admin tries send a campaign already sent
  Given I am logged in to graphql as admin
  And I send a GraphQL POST request:
  """
  {
    "query": "mutation ($input: SendEmailingCampaignInput!) {
      sendEmailingCampaign(input: $input) {
        error
        emailingCampaign {
          status
        }
      }
    }",
    "variables": {
      "input": {
        "id": "RW1haWxpbmdDYW1wYWlnbjpDYW1wYWlnblRvUmVtaW5kVG9Db25maXJt"
      }
    }
  }
  """
  Then the JSON response should match:
  """
  {
    "data": {
      "sendEmailingCampaign": {
        "error": "CANNOT_BE_SENT",
        "emailingCampaign": null
      }
    }
  }
  """

Scenario: GraphQL project owner tries to send its draft campaign but is not complete
  Given I am logged in to graphql as theo
  And I send a GraphQL POST request:
  """
  {
    "query": "mutation ($input: SendEmailingCampaignInput!) {
      sendEmailingCampaign(input: $input) {
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
      "sendEmailingCampaign": {
        "error": "CANNOT_BE_SENT",
        "emailingCampaign": null
      }
    }
  }
  """

Scenario: GraphQL project owner tries to send other one campaign
  Given I am logged in to graphql as theo
  And I send a GraphQL POST request:
  """
  {
    "query": "mutation ($input: SendEmailingCampaignInput!) {
      sendEmailingCampaign(input: $input) {
        error
        emailingCampaign {
          status
        }
      }
    }",
    "variables": {
      "input": {
        "id": "RW1haWxpbmdDYW1wYWlnbjpDYW1wYWlnblRvQ292aWRQYXJ0aWNpcGFudHM="
      }
    }
  }
  """
  Then the JSON response should match:
  """
  {"errors":[{"message":"Access denied to this field.","@*@": "@*@"}],"data":{"sendEmailingCampaign":null}}
  """

@database
Scenario: Organization admin send a draft campaign
  Given I am logged in to graphql as VMD
  And I send a GraphQL POST request:
  """
  {
    "query": "mutation ($input: SendEmailingCampaignInput!) {
      sendEmailingCampaign(input: $input) {
        error
        emailingCampaign {
          status
        }
      }
    }",
    "variables": {
      "input": {
        "id": "RW1haWxpbmdDYW1wYWlnbjpDYW1wYWlnblRvT3JnYW5pemF0aW9uRHJhZnQ="
      }
    }
  }
  """
  Then the JSON response should match:
  """
  {
    "data": {
      "sendEmailingCampaign": {
        "error": null,
        "emailingCampaign": {
          "status": "SENT"
        }
      }
    }
  }
  """