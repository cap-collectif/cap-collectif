@emailingCampaign @admin
Feature: emailingCampaign

@database
Scenario: GraphQL admin deletes a draft campaign and archives a sent campaign
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
Scenario: GraphQL project owner deletes its draft campaign
  Given I am logged in to graphql as theo
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
          "RW1haWxpbmdDYW1wYWlnbjpDYW1wYWlnblRvUHJvamVjdFdpdGhPd25lcg=="
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
        "archivedIds": [],
        "deletedIds": ["RW1haWxpbmdDYW1wYWlnbjpDYW1wYWlnblRvUHJvamVjdFdpdGhPd25lcg=="]
      }
    }
  }
  """

Scenario: GraphQL project owner tries to delete a draft campaign
  Given I am logged in to graphql as theo
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
        "ids": ["RW1haWxpbmdDYW1wYWlnbjpDYW1wYWlnblRvQ292aWRQYXJ0aWNpcGFudHM="]
      }
    }
  }
  """
  Then the JSON response should match:
  """
  {"errors":[{"message":"Access denied to this field.","@*@": "@*@"}],"data":{"deleteEmailingCampaigns":null}}
  """

Scenario: GraphQL admin gives wrong id for deleting
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
  {"errors":[{"message":"Access denied to this field.","@*@": "@*@"}],"data":{"deleteEmailingCampaigns":null}}
  """

@database
Scenario: GraphQL admin gives no id for deleting
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