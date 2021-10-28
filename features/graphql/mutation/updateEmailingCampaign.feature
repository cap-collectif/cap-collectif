@emailingCampaign @admin
Feature: emailingCampaign

@database
Scenario: GraphQL admin updates a campaign
  Given I am logged in to graphql as admin
  And I send a GraphQL POST request:
  """
  {
    "query": "mutation ($input: UpdateEmailingCampaignInput!) {
      updateEmailingCampaign(input: $input) {
        error
        emailingCampaign {
          name
          senderEmail
          senderName
          object
          content
          unlayerConf
          sendAt
          status
          mailingInternal
          preview
        }
      }
    }",
    "variables": {
      "input": {
        "id": "RW1haWxpbmdDYW1wYWlnbjpDYW1wYWlnblRvQ292aWRQYXJ0aWNpcGFudHM=",
        "name": "new name",
        "senderEmail": "new@cap-collectif.com",
        "senderName": "new sender name",
        "object": "new object",
        "content": "new content",
        "sendAt": "2025-01-01 00:00:00",
        "mailingInternal": "NOT_CONFIRMED",
        "unlayerConf": "{\"what\": \"configuration\"}"
      }
    }
  }
  """
  Then the JSON response should match:
  """
  {
    "data": {
      "updateEmailingCampaign": {
        "error": null,
        "emailingCampaign": {
          "name": "new name",
          "senderEmail": "new@cap-collectif.com",
          "senderName": "new sender name",
          "object": "new object",
          "content": "new content",
          "unlayerConf": "{\"what\": \"configuration\"}",
          "sendAt": "2025-01-01 00:00:00",
          "status": "DRAFT",
          "mailingInternal": "NOT_CONFIRMED",
          "preview": @string@
        }
      }
    }
  }
  """

@database
Scenario: GraphQL admin updates a campaign with a mailing list
  Given I am logged in to graphql as admin
  And I send a GraphQL POST request:
  """
  {
    "query": "mutation ($input: UpdateEmailingCampaignInput!) {
      updateEmailingCampaign(input: $input) {
        error
        emailingCampaign {
          name
          senderEmail
          senderName
          mailingList {
            id
          }
        }
      }
    }",
    "variables": {
      "input": {
        "id": "RW1haWxpbmdDYW1wYWlnbjpDYW1wYWlnblRvQ292aWRQYXJ0aWNpcGFudHM=",
        "name": "new name",
        "senderEmail": "new@cap-collectif.com",
        "senderName": "new sender name",
        "mailingList": "TWFpbGluZ0xpc3Q6bWFpbGlnbkxpc3RGcm9tQ292aWRQcm9qZWN0"
      }
    }
  }
  """
  Then the JSON response should match:
  """
  {
    "data": {
      "updateEmailingCampaign": {
        "error": null,
        "emailingCampaign": {
          "name": "new name",
          "senderEmail": "new@cap-collectif.com",
          "senderName": "new sender name",
          "mailingList": {
            "id": "TWFpbGluZ0xpc3Q6bWFpbGlnbkxpc3RGcm9tQ292aWRQcm9qZWN0"
          }
        }
      }
    }
  }
  """

Scenario: GraphQL admin try to update a non existing campaign
  Given I am logged in to graphql as admin
  And I send a GraphQL POST request:
  """
  {
    "query": "mutation ($input: UpdateEmailingCampaignInput!) {
      updateEmailingCampaign(input: $input) {
        error
        emailingCampaign {
          name
          senderEmail
          senderName
          object
          content
        }
      }
    }",
    "variables": {
      "input": {
        "id": "iDoNotExist",
        "name": "new name",
        "senderEmail": "new@cap-collectif.com",
        "senderName": "new sender name",
        "object": "new object",
        "content": "new content"
      }
    }
  }
  """
  Then the JSON response should match:
  """
  {
    "data": {
      "updateEmailingCampaign": {
        "error": "ID_NOT_FOUND",
        "emailingCampaign": null
      }
    }
  }
  """

Scenario: GraphQL admin try to update a campaign already sent
  Given I am logged in to graphql as admin
  And I send a GraphQL POST request:
  """
  {
    "query": "mutation ($input: UpdateEmailingCampaignInput!) {
      updateEmailingCampaign(input: $input) {
        error
        emailingCampaign {
          name
          senderEmail
          senderName
          object
          content
        }
      }
    }",
    "variables": {
      "input": {
        "id": "RW1haWxpbmdDYW1wYWlnbjpDYW1wYWlnblRvUmVtaW5kVG9Db25maXJt",
        "name": "new name",
        "senderEmail": "new@cap-collectif.com",
        "senderName": "new sender name",
        "object": "new object",
        "content": "new content"
      }
    }
  }
  """
  Then the JSON response should match:
  """
  {
    "data": {
      "updateEmailingCampaign": {
        "error": "NOT_EDITABLE",
        "emailingCampaign": null
      }
    }
  }
  """

Scenario: GraphQL admin tries to update a campaign with date already past
  Given I am logged in to graphql as admin
  And I send a GraphQL POST request:
  """
  {
    "query": "mutation ($input: UpdateEmailingCampaignInput!) {
      updateEmailingCampaign(input: $input) {
        error
        emailingCampaign {
          name
          senderEmail
          senderName
          object
          content
        }
      }
    }",
    "variables": {
      "input": {
        "id": "RW1haWxpbmdDYW1wYWlnbjpDYW1wYWlnblRvQ292aWRQYXJ0aWNpcGFudHM=",
        "name": "new name",
        "senderEmail": "new@cap-collectif.com",
        "senderName": "new sender name",
        "object": "new object",
        "content": "new content",
        "sendAt": "2020-01-01 00:00:00"
      }
    }
  }
  """
  Then the JSON response should match:
  """
  {
    "data": {
      "updateEmailingCampaign": {
        "error": "TOO_LATE",
        "emailingCampaign": null
      }
    }
  }
  """

Scenario: GraphQL admin updates a campaign with both an internal list and a mailing list
  Given I am logged in to graphql as admin
  And I send a GraphQL POST request:
  """
  {
    "query": "mutation ($input: UpdateEmailingCampaignInput!) {
      updateEmailingCampaign(input: $input) {
        error
        emailingCampaign {
          name
          senderEmail
          senderName
          mailingList {
            id
          }
          mailingInternal
        }
      }
    }",
    "variables": {
      "input": {
        "id": "RW1haWxpbmdDYW1wYWlnbjpDYW1wYWlnblRvQ292aWRQYXJ0aWNpcGFudHM=",
        "name": "new name",
        "senderEmail": "new@cap-collectif.com",
        "senderName": "new sender name",
        "mailingList": "TWFpbGluZ0xpc3Q6bWFpbGlnbkxpc3RGcm9tQ292aWRQcm9qZWN0",
        "mailingInternal": "CONFIRMED"
      }
    }
  }
  """
  Then the JSON response should match:
  """
  {
    "data": {
      "updateEmailingCampaign": {
        "error": "DOUBLE_LIST",
        "emailingCampaign": null
      }
    }
  }
  """

Scenario: GraphQL admin updates a campaign with wrong non existing list
  Given I am logged in to graphql as admin
  And I send a GraphQL POST request:
  """
  {
    "query": "mutation ($input: UpdateEmailingCampaignInput!) {
      updateEmailingCampaign(input: $input) {
        error
        emailingCampaign {
          name
          senderEmail
          senderName
          mailingList {
            id
          }
          mailingInternal
        }
      }
    }",
    "variables": {
      "input": {
        "id": "RW1haWxpbmdDYW1wYWlnbjpDYW1wYWlnblRvQ292aWRQYXJ0aWNpcGFudHM=",
        "name": "new name",
        "senderEmail": "new@cap-collectif.com",
        "senderName": "new sender name",
        "mailingList": "jpec"
      }
    }
  }
  """
  Then the JSON response should match:
  """
  {
    "data": {
      "updateEmailingCampaign": {
        "error": "MAILING_LIST_NOT_FOUND",
        "emailingCampaign": null
      }
    }
  }
  """

Scenario: GraphQL admin updates a campaign with wrong non existing internal list
  Given I am logged in to graphql as admin
  And I send a GraphQL POST request:
  """
  {
    "query": "mutation ($input: UpdateEmailingCampaignInput!) {
      updateEmailingCampaign(input: $input) {
        error
        emailingCampaign {
          name
          senderEmail
          senderName
          mailingList {
            id
          }
          mailingInternal
        }
      }
    }",
    "variables": {
      "input": {
        "id": "RW1haWxpbmdDYW1wYWlnbjpDYW1wYWlnblRvQ292aWRQYXJ0aWNpcGFudHM=",
        "name": "new name",
        "senderEmail": "new@cap-collectif.com",
        "senderName": "new sender name",
        "mailingInternal": "jpec"
      }
    }
  }
  """
  Then the JSON response should match:
  """
  {
    "data": {
      "updateEmailingCampaign": {
        "error": "MAILING_LIST_NOT_FOUND",
        "emailingCampaign": null
      }
    }
  }
  """

@database
Scenario: GraphQL project owner updates its campaign
  Given I am logged in to graphql as theo
  And I send a GraphQL POST request:
  """
  {
    "query": "mutation ($input: UpdateEmailingCampaignInput!) {
      updateEmailingCampaign(input: $input) {
        error
        emailingCampaign {
          name
        }
      }
    }",
    "variables": {
      "input": {
        "id": "RW1haWxpbmdDYW1wYWlnbjpDYW1wYWlnblRvUHJvamVjdFdpdGhPd25lcg==",
        "name": "new name",
        "senderEmail": "new@cap-collectif.com",
        "senderName": "new sender name",
        "mailingList": "TWFpbGluZ0xpc3Q6ZW1wdHlNYWlsaW5nTGlzdFdpdGhPd25lcg=="
      }
    }
  }
  """
  Then the JSON response should match:
  """
  {
    "data": {
      "updateEmailingCampaign": {
        "error": null,
        "emailingCampaign": {
          "name": "new name"
        }
      }
    }
  }
  """

Scenario: GraphQL project owner tries to update other one campaign
  Given I am logged in to graphql as theo
  And I send a GraphQL POST request:
  """
  {
    "query": "mutation ($input: UpdateEmailingCampaignInput!) {
      updateEmailingCampaign(input: $input) {
        error
        emailingCampaign {
          name
        }
      }
    }",
    "variables": {
      "input": {
        "id": "RW1haWxpbmdDYW1wYWlnbjpDYW1wYWlnblRvQ292aWRQYXJ0aWNpcGFudHM=",
        "name": "new name",
        "senderEmail": "new@cap-collectif.com",
        "senderName": "new sender name",
        "mailingList": "TWFpbGluZ0xpc3Q6ZW1wdHlNYWlsaW5nTGlzdFdpdGhPd25lcg=="
      }
    }
  }
  """
  Then the JSON response should match:
  """
  {
    "data": {
      "updateEmailingCampaign": {
        "error": "ID_NOT_FOUND",
        "emailingCampaign": null
      }
    }
  }
  """

Scenario: GraphQL project owner tries to update its campaign with another ones mailing list
  Given I am logged in to graphql as theo
  And I send a GraphQL POST request:
  """
  {
    "query": "mutation ($input: UpdateEmailingCampaignInput!) {
      updateEmailingCampaign(input: $input) {
        error
        emailingCampaign {
          name
        }
      }
    }",
    "variables": {
      "input": {
        "id": "RW1haWxpbmdDYW1wYWlnbjpDYW1wYWlnblRvUHJvamVjdFdpdGhPd25lcg==",
        "name": "new name",
        "senderEmail": "new@cap-collectif.com",
        "senderName": "new sender name",
        "mailingList": "TWFpbGluZ0xpc3Q6bWFpbGlnbkxpc3RGcm9tQ292aWRQcm9qZWN0"
      }
    }
  }
  """
  Then the JSON response should match:
  """
  {
    "data": {
      "updateEmailingCampaign": {
        "error": "MAILING_LIST_NOT_FOUND",
        "emailingCampaign": null
      }
    }
  }
  """

Scenario: GraphQL project owner tries to update its campaign with internal mailing list
  Given I am logged in to graphql as theo
  And I send a GraphQL POST request:
  """
  {
    "query": "mutation ($input: UpdateEmailingCampaignInput!) {
      updateEmailingCampaign(input: $input) {
        error
        emailingCampaign {
          name
        }
      }
    }",
    "variables": {
      "input": {
        "id": "RW1haWxpbmdDYW1wYWlnbjpDYW1wYWlnblRvUHJvamVjdFdpdGhPd25lcg==",
        "name": "new name",
        "senderEmail": "new@cap-collectif.com",
        "senderName": "new sender name",
        "mailingInternal": "NOT_CONFIRMED"
      }
    }
  }
  """
  Then the JSON response should match:
  """
  {
    "data": {
      "updateEmailingCampaign": {
        "error": "MAILING_LIST_NOT_FOUND",
        "emailingCampaign": null
      }
    }
  }
  """