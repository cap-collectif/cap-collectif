@emailingCampaign @admin
Feature: emailingCampaign

@database
Scenario: GraphQL project owner creates a campaign
  Given I am logged in to graphql as theo
  And I send a GraphQL POST request:
  """
  {
    "query": "mutation ($input: CreateEmailingCampaignInput!) {
      createEmailingCampaign(input: $input) {
        error
        emailingCampaign {
          name
          owner {
            username
          }
          mailingList {
            id
          }
          mailingInternal
          status
          sendAt
          preview
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
          "owner": {
            "username": "Théo QP"
          },
          "mailingList": null,
          "mailingInternal": null,
          "status": "DRAFT",
          "sendAt": null,
          "preview": @string@
        }
      }
    }
  }
  """

@database
Scenario: GraphQL admin creates a campaign from an internal list
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
        "mailingList": "REGISTERED"
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
          "mailingInternal": "REGISTERED"
        }
      }
    }
  }
  """

Scenario: GraphQL project owner wants to create a campaign from an internal list
  Given I am logged in to graphql as theo
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
        "mailingList": "REGISTERED"
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
Scenario: GraphQL project owner creates a campaign from its mailing list
  Given I am logged in to graphql as theo
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
        "mailingList": "TWFpbGluZ0xpc3Q6ZW1wdHlNYWlsaW5nTGlzdFdpdGhPd25lcg=="
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
            "id": "TWFpbGluZ0xpc3Q6ZW1wdHlNYWlsaW5nTGlzdFdpdGhPd25lcg==",
            "isDeletable": false
          },
          "mailingInternal": null
        }
      }
    }
  }
  """

Scenario: GraphQL project owner creates a campaign from other one mailing list
  Given I am logged in to graphql as theo
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
        "error": "ID_NOT_FOUND_MAILING_LIST",
        "emailingCampaign": null
      }
    }
  }
  """

@database
Scenario: GraphQL admin creates a campaign from a mailing list
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
Scenario: GraphQL admin creates a campaign from a group
  Given I am logged in to graphql as admin
  And I send a GraphQL POST request:
  """
  {
    "query": "mutation ($input: CreateEmailingCampaignInput!) {
      createEmailingCampaign(input: $input) {
        error
        emailingCampaign {
          emailingGroup {
            id
          }
        }
      }
    }",
    "variables": {
      "input": {
        "emailingGroup": "R3JvdXA6Z3JvdXAy"
      }
    }
  }
  """
  Then the JSON response should match:
  """
  {
    "data": {
      "createEmailingCampaign": {
         "error":null,
         "emailingCampaign":{
            "emailingGroup":{
               "id":"R3JvdXA6Z3JvdXAy"
            }
         }
      }
    }
  }
  """

@database
Scenario: GraphQL admin wants to create a campaign with a wrong mailing list
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
Scenario: GraphQL project owner creates a campaign from its project
  Given I am logged in to graphql as theo
  And I send a GraphQL POST request:
  """
  {
    "query": "mutation ($input: CreateEmailingCampaignInput!) {
      createEmailingCampaign(input: $input) {
        error
        emailingCampaign {
          name
          project {
            title
          }
        }
      }
    }",
    "variables": {
      "input": {
        "project": "UHJvamVjdDpwcm9qZWN0V2l0aE93bmVy"
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
          "name": "global.campaign.new",
          "project": {
            "title": "Projet avec administrateur de projet"
          }
        }
      }
    }
  }
  """

@database
Scenario: GraphQL project owner creates a campaign from another project and get an error
  Given I am logged in to graphql as theo
  And I send a GraphQL POST request:
  """
  {
    "query": "mutation ($input: CreateEmailingCampaignInput!) {
      createEmailingCampaign(input: $input) {
        error
        emailingCampaign {
          name
          project {
            title
          }
        }
      }
    }",
    "variables": {
      "input": {
        "project": "UHJvamVjdDpwcm9qZWN0MQ=="
      }
    }
  }
  """
  Then the JSON response should match:
  """
  {
    "data": {
      "createEmailingCampaign": {
        "error": "ID_NOT_FOUND_PROJECT",
        "emailingCampaign": null
      }
    }
  }
  """

@database
Scenario: GraphQL admin wants to create a campaign with both group and organic list
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
        "mailingList": "TWFpbGluZ0xpc3Q6bWFpbGlnbkxpc3RGcm9tQ292aWRQcm9qZWN0",
        "emailingGroup": "R3JvdXA6Z3JvdXAy"
      }
    }
  }
  """
  Then the JSON response should match:
  """
  {
    "data": {
      "createEmailingCampaign": {
        "error": "DOUBLE_LIST",
        "emailingCampaign": null
      }
    }
  }
  """
