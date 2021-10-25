@mailingList @admin
Feature: mailingList

@database
Scenario: GraphQL client wants to create a mailing list without project
  Given I am logged in to graphql as admin
  And I send a GraphQL POST request:
  """
  {
    "query": "mutation ($input: CreateMailingListInput!) {
      createMailingList(input: $input) {
        error
        mailingList {
          name
          owner {
            username
          }
          project {
            title
          }
          users {
            totalCount
          }
          isDeletable
        }
      }
    }",
    "variables": {
      "input": {
        "name": "equipe tech",
        "userIds": [
         "VXNlcjp1c2VyTWlja2FlbA==",
          "VXNlcjp1c2VyU3B5bA==",
          "VXNlcjp1c2VyQWd1aQ==",
          "VXNlcjp1c2VyVGhlbw==",
          "VXNlcjp1c2VyT21hcg==",
          "VXNlcjp1c2VySmVhbg==",
          "VXNlcjp1c2VyTWF4aW1l",
          "VXNlcjp1c2VyVmluY2VudA=="
        ]
      }
    }
  }
  """
  Then the JSON response should match:
  """
  {
    "data": {
      "createMailingList": {
        "error": null,
        "mailingList": {
          "name": "equipe tech",
          "owner": {
            "username": "admin"
          },
          "project": null,
          "users": {
            "totalCount": 8
          },
          "isDeletable": true
        }
      }
    }
  }
  """

@database
Scenario: GraphQL client wants to create a mailing list from project
  Given I am logged in to graphql as admin
  And I send a GraphQL POST request:
  """
  {
    "query": "mutation ($input: CreateMailingListInput!) {
      createMailingList(input: $input) {
        error
        mailingList {
          name
          project {
            title
          }
          users {
            totalCount
          }
          isDeletable
        }
      }
    }",
    "variables": {
      "input": {
        "name": "equipe tech",
        "userIds": [
         "VXNlcjp1c2VyTWlja2FlbA==",
          "VXNlcjp1c2VyU3B5bA==",
          "VXNlcjp1c2VyQWd1aQ==",
          "VXNlcjp1c2VyVGhlbw==",
          "VXNlcjp1c2VyT21hcg==",
          "VXNlcjp1c2VySmVhbg==",
          "VXNlcjp1c2VyTWF4aW1l",
          "VXNlcjp1c2VyVmluY2VudA=="
        ],
        "project": "UHJvamVjdDpwcm9qZWN0Q29yb25h"
      }
    }
  }
  """
  Then the JSON response should match:
  """
  {
    "data": {
      "createMailingList": {
        "error": null,
        "mailingList": {
          "name": "equipe tech",
          "project": {
            "title": "Solidarité Covid-19"
          },
          "users": {
            "totalCount": 8
          },
          "isDeletable": true
        }
      }
    }
  }
  """

@database
Scenario: GraphQL client wants to delete a mailing list
  Given I am logged in to graphql as admin
  And I send a GraphQL POST request:
  """
  {
    "query": "mutation ($input: DeleteMailingListInput!) {
      deleteMailingList(input: $input) {
        error
        deletedIds
      }
    }",
    "variables": {
      "input": {
        "ids": ["TWFpbGluZ0xpc3Q6bWFpbGlnbkxpc3RGcm9tQ292aWRQcm9qZWN0"]
      }
    }
  }
  """
  Then the JSON response should match:
  """
  {
    "data": {
      "deleteMailingList": {
        "error": null,
        "deletedIds": ["TWFpbGluZ0xpc3Q6bWFpbGlnbkxpc3RGcm9tQ292aWRQcm9qZWN0"]
      }
    }
  }
  """

########### ERRORS #################
Scenario: GraphQL client wants to create a mailing but send no user ids
  Given I am logged in to graphql as admin
  And I send a GraphQL POST request:
  """
  {
    "query": "mutation ($input: CreateMailingListInput!) {
      createMailingList(input: $input) {
        error
        mailingList {
          name
        }
      }
    }",
    "variables": {
      "input": {
        "name": "empty list",
        "userIds": []
      }
    }
  }
  """
  Then the JSON response should match:
  """
  {
    "data": {
      "createMailingList": {
        "error": "EMPTY_USERS",
        "mailingList": null
      }
    }
  }
  """

Scenario: GraphQL client wants to create a mailing but send wrong user id
  Given I am logged in to graphql as admin
  And I send a GraphQL POST request:
  """
  {
    "query": "mutation ($input: CreateMailingListInput!) {
      createMailingList(input: $input) {
        error
        mailingList {
          name
        }
      }
    }",
    "variables": {
      "input": {
        "name": "error list",
        "userIds": ["wrongId"]
      }
    }
  }
  """
  Then the JSON response should match:
  """
  {
    "data": {
      "createMailingList": {
        "error": "ID_NOT_FOUND_USER",
        "mailingList": null
      }
    }
  }
  """

Scenario: GraphQL client wants to create a mailing but send wrong project id
  Given I am logged in to graphql as admin
  And I send a GraphQL POST request:
  """
  {
    "query": "mutation ($input: CreateMailingListInput!) {
      createMailingList(input: $input) {
        error
        mailingList {
          name
        }
      }
    }",
    "variables": {
      "input": {
        "name": "error list",
        "userIds": ["VXNlcjp1c2VyTWlja2FlbA=="],
        "project": "wrongId"
      }
    }
  }
  """
  Then the JSON response should match:
  """
  {
    "data": {
      "createMailingList": {
        "error": "ID_NOT_FOUND_PROJECT",
        "mailingList": null
      }
    }
  }
  """

Scenario: GraphQL client wants to delete a mailing list but provide wrong id
  Given I am logged in to graphql as admin
  And I send a GraphQL POST request:
  """
  {
    "query": "mutation ($input: DeleteMailingListInput!) {
      deleteMailingList(input: $input) {
        error
        deletedIds
      }
    }",
    "variables": {
      "input": {
        "ids": ["TWFpbGluZ0xpc3Q6bWFpbGlnbkxpc3RGcm9tQ292aWRQcm9qZWN0", "wrongId"]
      }
    }
  }
  """
  Then the JSON response should match:
  """
  {
    "data": {
      "deleteMailingList": {
        "error": "ID_NOT_FOUND",
        "deletedIds": []
      }
    }
  }
  """

Scenario: GraphQL client wants to delete a mailing list but provide no id
  Given I am logged in to graphql as admin
  And I send a GraphQL POST request:
  """
  {
    "query": "mutation ($input: DeleteMailingListInput!) {
      deleteMailingList(input: $input) {
        error
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
      "deleteMailingList": {
        "error": "EMPTY_MAILING_LISTS",
        "deletedIds": []
      }
    }
  }
  """

Scenario: GraphQL client wants to delete a not deletable mailing list
  Given I am logged in to graphql as admin
  And I send a GraphQL POST request:
  """
  {
    "query": "mutation ($input: DeleteMailingListInput!) {
      deleteMailingList(input: $input) {
        error
        deletedIds
      }
    }",
    "variables": {
      "input": {
        "ids": ["TWFpbGluZ0xpc3Q6bWFpbGluZ0xpc3RXaXRob3V0UHJvamVjdA=="]
      }
    }
  }
  """
  Then the JSON response should match:
  """
  {
    "data": {
      "deleteMailingList": {
        "error": "NOT_DELETABLE",
        "deletedIds": []
      }
    }
  }
  """
