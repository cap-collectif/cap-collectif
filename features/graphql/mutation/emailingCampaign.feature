@emailingCampaign @admin
Feature: emailingCampaign

@database
Scenario: GraphQL client wants to create a campaign
  Given I am logged in to graphql as admin
  And I send a GraphQL POST request:
  """
  {
    "query": "mutation ($input: CreateEmailingCampaignInput!) {
      createEmailingCampaign(input: $input) {
        error
        emailingCampaign {
          name
          mailingList {
            id
          }
          mailingInternal
          status
          sendAt
        }
      }
    }",
    "variables": {
      "input": {}
    }
  }
  """
  Then the JSON response should match:
  """
  {
    "data": {
      "createEmailingCampaign": {
        "error": null,
        "emailingCampaign": {
          "name": "global.campaign.new",
          "mailingList": null,
          "mailingInternal": null,
          "status": "DRAFT",
          "sendAt": null
        }
      }
    }
  }
  """

@database
Scenario: GraphQL client wants to create a campaign from an internal list
  Given I am logged in to graphql as admin
  And I send a GraphQL POST request:
  """
  {
    "query": "mutation ($input: CreateEmailingCampaignInput!) {
      createEmailingCampaign(input: $input) {
        error
        emailingCampaign {
          mailingList {
            id
          }
          mailingInternal
        }
      }
    }",
    "variables": {
      "input": {
        "mailingList": "NOT_CONFIRMED"
      }
    }
  }
  """
  Then the JSON response should match:
  """
  {
    "data": {
      "createEmailingCampaign": {
        "error": null,
        "emailingCampaign": {
          "mailingList": null,
          "mailingInternal": "NOT_CONFIRMED"
        }
      }
    }
  }
  """

@database
Scenario: GraphQL client wants to create a campaign from a mailing list
  Given I am logged in to graphql as admin
  And I send a GraphQL POST request:
  """
  {
    "query": "mutation ($input: CreateEmailingCampaignInput!) {
      createEmailingCampaign(input: $input) {
        error
        emailingCampaign {
          mailingList {
            id
            isDeletable
          }
          mailingInternal
        }
      }
    }",
    "variables": {
      "input": {
        "mailingList": "TWFpbGluZ0xpc3Q6bWFpbGlnbkxpc3RGcm9tQ292aWRQcm9qZWN0"
      }
    }
  }
  """
  Then the JSON response should match:
  """
  {
    "data": {
      "createEmailingCampaign": {
        "error": null,
        "emailingCampaign": {
          "mailingList": {
            "id": "TWFpbGluZ0xpc3Q6bWFpbGlnbkxpc3RGcm9tQ292aWRQcm9qZWN0",
            "isDeletable": false
          },
          "mailingInternal": null
        }
      }
    }
  }
  """

@database
Scenario: GraphQL client wants to create a campaign with a wrong mailing list
  Given I am logged in to graphql as admin
  And I send a GraphQL POST request:
  """
  {
    "query": "mutation ($input: CreateEmailingCampaignInput!) {
      createEmailingCampaign(input: $input) {
        error
        emailingCampaign {
          mailingList {
            id
          }
          mailingInternal
        }
      }
    }",
    "variables": {
      "input": {
        "mailingList": "fail"
      }
    }
  }
  """
  Then the JSON response should match:
  """
  {
    "data": {
      "createEmailingCampaign": {
        "error": "ID_NOT_FOUND_MAILING_LIST",
        "emailingCampaign": null
      }
    }
  }
  """

@database
Scenario: GraphQL client deletes a draft campaign and archives a sent campaign
  Given I am logged in to graphql as admin
  And I send a GraphQL POST request:
  """
  {
    "query": "mutation ($input: DeleteEmailingCampaignsInput!) {
      deleteEmailingCampaigns(input: $input) {
        error
        archivedIds
        deletedIds
      }
    }",
    "variables": {
      "input": {
        "ids": [
          "RW1haWxpbmdDYW1wYWlnbjpDYW1wYWlnblRvUmVtaW5kVG9Db25maXJt",
          "RW1haWxpbmdDYW1wYWlnbjpDYW1wYWlnblRvQ292aWRQYXJ0aWNpcGFudHM="
        ]
      }
    }
  }
  """
  Then the JSON response should match:
  """
  {
    "data": {
      "deleteEmailingCampaigns": {
        "error": null,
        "archivedIds": ["RW1haWxpbmdDYW1wYWlnbjpDYW1wYWlnblRvUmVtaW5kVG9Db25maXJt"],
        "deletedIds": ["RW1haWxpbmdDYW1wYWlnbjpDYW1wYWlnblRvQ292aWRQYXJ0aWNpcGFudHM="]
      }
    }
  }
  """

@database
Scenario: GraphQL client gives wrong id for deleting
  Given I am logged in to graphql as admin
  And I send a GraphQL POST request:
  """
  {
    "query": "mutation ($input: DeleteEmailingCampaignsInput!) {
      deleteEmailingCampaigns(input: $input) {
        error
        archivedIds
        deletedIds
      }
    }",
    "variables": {
      "input": {
        "ids": [
          "RW1haWxpbmdDYW1wYWlnbjpDYW1wYWlnblRvUmVtaW5kVG9Db25maXJt",
          "RW1haWxpbmdDYW1wYWlnbjpDYW1wYWlnblRvQ292aWRQYXJ0aWNpcGFudHM=",
          "fail"
        ]
      }
    }
  }
  """
  Then the JSON response should match:
  """
  {
    "data": {
      "deleteEmailingCampaigns": {
        "error": "ID_NOT_FOUND",
        "archivedIds": [],
        "deletedIds": []
      }
    }
  }
  """

@database
Scenario: GraphQL client gives no id for deleting
  Given I am logged in to graphql as admin
  And I send a GraphQL POST request:
  """
  {
    "query": "mutation ($input: DeleteEmailingCampaignsInput!) {
      deleteEmailingCampaigns(input: $input) {
        error
        archivedIds
        deletedIds
      }
    }",
    "variables": {
      "input": {
        "ids": []
      }
    }
  }
  """
  Then the JSON response should match:
  """
  {
    "data": {
      "deleteEmailingCampaigns": {
        "error": "EMPTY",
        "archivedIds": [],
        "deletedIds": []
      }
    }
  }
  """

@database
Scenario: GraphQL client updates a campaign
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
          sendAt
          status
          mailingInternal
        }
      }
    }",
    "variables": {
      "input": {
        "id": "RW1haWxpbmdDbWFwYWlnbjpDYW1wYWlnblRvQ292aWRQYXJ0aWNpcGFudHM=",
        "name": "new name",
        "senderEmail": "new@cap-collectif.com",
        "senderName": "new sender name",
        "object": "new object",
        "content": "new content",
        "sendAt": "2025-01-01 00:00:00",
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
        "error": null,
        "emailingCampaign": {
          "name": "new name",
          "senderEmail": "new@cap-collectif.com",
          "senderName": "new sender name",
          "object": "new object",
          "content": "new content",
          "sendAt": "2025-01-01 00:00:00",
          "status": "PLANNED",
          "mailingInternal": "NOT_CONFIRMED"
        }
      }
    }
  }
  """

@database
Scenario: GraphQL client updates a campaign with a mailing list
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
        "id": "RW1haWxpbmdDbWFwYWlnbjpDYW1wYWlnblRvQ292aWRQYXJ0aWNpcGFudHM=",
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

Scenario: GraphQL client try to update a non existing campaign
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

Scenario: GraphQL client try to update a campaign already sent
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
        "id": "RW1haWxpbmdDbWFwYWlnbjpDYW1wYWlnblRvUmVtaW5kVG9Db25maXJt",
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

Scenario: GraphQL client try to update a campaign with date already past
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
        "id": "RW1haWxpbmdDbWFwYWlnbjpDYW1wYWlnblRvQ292aWRQYXJ0aWNpcGFudHM=",
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

Scenario: GraphQL client updates a campaign with both an internal list and a mailing list
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
        "id": "RW1haWxpbmdDbWFwYWlnbjpDYW1wYWlnblRvQ292aWRQYXJ0aWNpcGFudHM=",
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

Scenario: GraphQL client updates a campaign with wrong non existing list
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
        "id": "RW1haWxpbmdDbWFwYWlnbjpDYW1wYWlnblRvQ292aWRQYXJ0aWNpcGFudHM=",
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

Scenario: GraphQL client updates a campaign with wrong non existing internal list
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
        "id": "RW1haWxpbmdDbWFwYWlnbjpDYW1wYWlnblRvQ292aWRQYXJ0aWNpcGFudHM=",
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
