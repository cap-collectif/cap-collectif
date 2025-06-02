@createGroup @admin
Feature: createGroup

@database
Scenario: GraphQL client wants to create a group
  Given I am logged in to graphql as admin
  And I send a GraphQL POST request:
"""
{
  "query": "mutation ($input: CreateGroupInput!) {
    createGroup(input: $input) {
      group {
        id
        title
      }
      importedUsers {
        email
      }
      notFoundEmails
      alreadyImportedUsers {
        email
      }
    }
  }",
  "variables": {
    "input": {
      "title": "Nouveau groupe",
      "emails": ["lbrunet@cap-collectif.com", "unexistentEmail@cap-collectif.com"],
      "dryRun": true
    }
  }
}
"""
  Then the JSON response should match:
"""
{
  "data": {
    "createGroup": {
      "group": {
        "id": @string@,
        "title": "Nouveau groupe"
      },
      "importedUsers": [{"email":"lbrunet@cap-collectif.com"}],
      "notFoundEmails": ["unexistentEmail@cap-collectif.com"],
      "alreadyImportedUsers": []
    }
  }
}
"""
