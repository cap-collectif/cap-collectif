@deleteVersion
Feature: Delete a version

@database
Scenario: Author wants to delete his version
  Given I am logged in to graphql as user
  And I send a GraphQL POST request:
  """
    {
        "query": "mutation ($input: DeleteVersionInput!) {
            deleteVersion(input: $input) {
                deletedVersionId
                opinion {
                    id
                }
            }
        }",
        "variables": {
            "input": {
                "versionId": "version1"
            }
        }
    }
  """
  Then the JSON response should match:
  """
    {
        "data": {
            "deleteVersion": {
                "deletedVersionId": "version1",
                "opinion": {
                    "id": "opinion57"
                }
            }
        }
    }
  """

@security
Scenario: User wants to delete a version but is not the author
  Given I am logged in to graphql as pierre
  And I send a GraphQL POST request:
  """
    {
        "query": "mutation ($input: DeleteVersionInput!) {
            deleteVersion(input: $input) {
                deletedVersionId
                opinion {
                    id
                }
            }
        }",
        "variables": {
            "input": {
                "versionId": "version1"
            }
        }
    }
  """
  Then the JSON response should match:
  """
    {"errors":[{"message":"You are not the author of version with id: version1","category":"user","locations":[@...@],"path":["deleteVersion"]}],"data":{"deleteVersion":null}}
  """
