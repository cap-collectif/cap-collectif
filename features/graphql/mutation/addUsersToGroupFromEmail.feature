@groups @addUsersToGroupFromEmail
Feature: Add users to a group from email.

Scenario: An admin wants to add a list of emails to a group with some wrong email with dry run
  Given I am logged in to graphql as admin
  And I send a GraphQL POST request:
  """
  {
    "query": "mutation ($input: AddUsersToGroupFromEmailInput!) {
      addUsersToGroupFromEmail(input: $input) {
        importedUsers {
          _id
          email
        }
        notFoundEmails
        alreadyImportedUsers {
          id
        }
      }
    }",
    "variables": {
      "input": {
        "emails": [
          "lbrunet@jolicode.com",
          "sfavot@jolicode.com",
          "pierre@cap-collectif.com",
          "unknown@unknown.com",
          "unknown@unknown.com"
        ],
        "dryRun": true,
        "groupId": "group5"
      }
    }
  }
  """
  Then the JSON response should match:
  """
  {
    "data": {
      "addUsersToGroupFromEmail": {
        "importedUsers": [
          {
            "_id": "user1",
            "email": "lbrunet@jolicode.com"
          },
          {
            "_id": "user2",
            "email": "sfavot@jolicode.com"
          },
          {
            "_id": "user505",
            "email": "pierre@cap-collectif.com"
          }
        ],
        "notFoundEmails": [
          "unknown@unknown.com"
        ],
        "alreadyImportedUsers": []
      }
    }
  }
  """
  Then I send a GraphQL POST request:
  """
  {
    "query": "query node ($groupId: ID!){
      group: node(id: $groupId) {
        ... on Group {
          users(first: 3) {
            totalCount
            edges {
              node {
                id
              }
            }
          }
        }
      }
    }",
    "variables": {
      "groupId": "group5"
    }
  }
  """
  Then the JSON response should match:
  """
  {
    "data": {
      "group": {
        "users": {
          "totalCount": 0,
          "edges": []
        }
      }
    }
  }
  """

@database
Scenario: An admin wants to add a list of emails to a group with some wrong email without dry run
  Given I am logged in to graphql as admin
  And I send a GraphQL POST request:
  """
  {
    "query": "mutation ($input: AddUsersToGroupFromEmailInput!) {
      addUsersToGroupFromEmail(input: $input) {
        importedUsers {
          _id
          email
        }
        notFoundEmails
        alreadyImportedUsers {
          id
        }
      }
    }",
    "variables": {
      "input": {
        "emails": [
          "lbrunet@jolicode.com",
          "sfavot@jolicode.com",
          "pierre@cap-collectif.com",
          "unknown@unknown.com"
        ],
        "dryRun": false,
        "groupId": "group5"
      }
    }
  }
  """
  Then the JSON response should match:
  """
  {
    "data": {
      "addUsersToGroupFromEmail": {
        "importedUsers": [
          {
            "_id": "user1",
            "email": "lbrunet@jolicode.com"
          },
          {
            "_id": "user2",
            "email": "sfavot@jolicode.com"
          },
          {
            "_id": "user505",
            "email": "pierre@cap-collectif.com"
          }
        ],
        "notFoundEmails": [
          "unknown@unknown.com"
        ],
        "alreadyImportedUsers": []
      }
    }
  }
  """
  Then I send a GraphQL POST request:
  """
  {
    "query": "query node ($groupId: ID!){
      group: node(id: $groupId) {
        ... on Group {
          users(first: 3) {
            totalCount
            edges {
              node {
                _id
              }
            }
          }
        }
      }
    }",
    "variables": {
      "groupId": "group5"
    }
  }
  """
  Then the JSON response should match:
  """
  {
    "data": {
      "group": {
        "users": {
          "totalCount": 3,
          "edges": [
            { "node": {"_id":"user1"} },
            { "node": {"_id":"user2"} },
            { "node": {"_id":"user505"} }
          ]
        }
      }
    }
  }
  """
