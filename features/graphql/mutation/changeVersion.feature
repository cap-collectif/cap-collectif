@changeVersion
Feature: Change Version

@database
Scenario: Author wants to update his version
  Given I am logged in to graphql as user
  And I send a GraphQL POST request:
  """
    {
        "query": "mutation ($input: ChangeVersionInput!) {
            changeVersion(input: $input) {
                version {
                    id
                    body
                    updatedAt
                }
            }
        }",
        "variables": {
            "input": {
                "versionId": "version1",
                "body": "New Tololo"
            }
        }
    }
  """
  Then the JSON response should match:
  """
    {
        "data": {
            "changeVersion": {
                "version": {
                    "id": "version1",
                    "body": "New Tololo",
                    "updatedAt": "@string@.isDateTime()"
                }
            }
        }
    }
  """

@security
Scenario: User wants to update a version but is not the author
  Given I am logged in to graphql as pierre
  And I send a GraphQL POST request:
  """
   {
        "query": "mutation ($input: ChangeVersionInput!) {
            changeVersion(input: $input) {
                version {
                    id
                }
            }
        }",
        "variables": {
            "input": {
                "versionId": "version1",
                "body": "New Tololo"
            }
        }
    }
  """
  Then the JSON response should match:
  """
    {"errors":[{"message":"Can't update the version of someone else.","@*@": "@*@"}],"data":{"changeVersion":null}}
  """
