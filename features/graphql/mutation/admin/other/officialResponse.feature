@officialResponse @admin
Feature: officialResponse

@database
Scenario: GraphQL client creates an officialResponse
  Given I am logged in to graphql as admin
  And I send a GraphQL POST request:
  """
  {
    "query": "mutation ($input: UpdateOfficialResponseInput!) {
      updateOfficialResponse(input: $input) {
        error
        officialResponse {
          body
          isPublished
          publishedAt
          authors {
            id
          }
          proposal {
            id
          }
        }
      }
    }",
    "variables": {
      "input": {
        "body": "<h3>Non.</h3><p>Cordialement</p>",
        "isPublished": false,
        "authors": ["VXNlcjp1c2VyU3B5bA=="],
        "proposal": "UHJvcG9zYWw6cHJvcG9zYWwxNw=="
      }
    }
  }
  """
  Then the JSON response should match:
  """
  {
    "data": {
      "updateOfficialResponse": {
        "error": null,
        "officialResponse": {
          "body": "<h3>Non.</h3><p>Cordialement</p>",
          "isPublished": false,
          "publishedAt": null,
          "authors": [
            {
              "id": "VXNlcjp1c2VyU3B5bA=="
            }
          ],
          "proposal": {
            "id": "UHJvcG9zYWw6cHJvcG9zYWwxNw=="
          }
        }
      }
    }
  }
  """

@database
Scenario: GraphQL client unpublish an officialResponse
  Given I am logged in to graphql as admin
  And I send a GraphQL POST request:
  """
  {
    "query": "mutation ($input: UpdateOfficialResponseInput!) {
      updateOfficialResponse(input: $input) {
        error
        officialResponse {
          isPublished
          publishedAt
        }
      }
    }",
    "variables": {
      "input": {
        "id": "T2ZmaWNpYWxSZXNwb25zZTpvZmZpY2lhbFJlc3BvbnNlMTE=",
        "body": "<h3>Non.</h3><p>Cordialement</p>",
        "isPublished": false,
        "authors": ["VXNlcjp1c2VyU3B5bA=="],
        "proposal": "UHJvcG9zYWw6cHJvcG9zYWwxNw=="
      }
    }
  }
  """
  Then the JSON response should match:
  """
  {
    "data":{
      "updateOfficialResponse":{
        "error":null,
        "officialResponse":{
          "isPublished":false,
          "publishedAt":null
        }
      }
    }
  }
  """

Scenario: GraphQL client wants to create an officialResponse but gives no author
  Given I am logged in to graphql as admin
  And I send a GraphQL POST request:
  """
  {
    "query": "mutation ($input: UpdateOfficialResponseInput!) {
      updateOfficialResponse(input: $input) {
        error
        officialResponse {
          id
        }
      }
    }",
    "variables": {
      "input": {
        "body": "new body",
        "isPublished": false,
        "authors": [],
        "proposal": "UHJvcG9zYWw6cHJvcG9zYWwxNw=="
      }
    }
  }
  """
  Then the JSON response should match:
  """
  {
    "data": {
      "updateOfficialResponse": {
        "error": "NO_AUTHOR",
        "officialResponse": null
      }
    }
  }
  """

Scenario: GraphQL client wants to create an officialResponse but wrong author id
  Given I am logged in to graphql as admin
  And I send a GraphQL POST request:
  """
  {
    "query": "mutation ($input: UpdateOfficialResponseInput!) {
      updateOfficialResponse(input: $input) {
        error
        officialResponse {
          id
        }
      }
    }",
    "variables": {
      "input": {
        "body": "new body",
        "isPublished": false,
        "authors": ["wrongId"],
        "proposal": "UHJvcG9zYWw6cHJvcG9zYWwxNw=="
      }
    }
  }
  """
  Then the JSON response should match:
  """
  {
    "data": {
      "updateOfficialResponse": {
        "error": "AUTHOR_NOT_FOUND",
        "officialResponse": null
      }
    }
  }
  """

Scenario: GraphQL client wants to create an officialResponse but wrong proposal id
  Given I am logged in to graphql as admin
  And I send a GraphQL POST request:
  """
  {
    "query": "mutation ($input: UpdateOfficialResponseInput!) {
      updateOfficialResponse(input: $input) {
        error
        officialResponse {
          id
        }
      }
    }",
    "variables": {
      "input": {
        "body": "new body",
        "isPublished": false,
        "authors": ["VXNlcjp1c2VyU3B5bA=="],
        "proposal": "wrongId"
      }
    }
  }
  """
  Then the JSON response should match:

  """
  {"errors":[{"message":"Access denied to this field.","@*@": "@*@"}],"data":{"updateOfficialResponse":null}}
  """

Scenario: GraphQL client wants to update an officialResponse but wrong id
  Given I am logged in to graphql as admin
  And I send a GraphQL POST request:
  """
  {
    "query": "mutation ($input: UpdateOfficialResponseInput!) {
      updateOfficialResponse(input: $input) {
        error
        officialResponse {
          id
        }
      }
    }",
    "variables": {
      "input": {
        "id": "wrongId",
        "body": "new body",
        "isPublished": false,
        "authors": ["VXNlcjp1c2VyU3B5bA=="],
        "proposal": "UHJvcG9zYWw6cHJvcG9zYWwxNw=="
      }
    }
  }
  """
  Then the JSON response should match:
  """
  {
    "data": {
      "updateOfficialResponse": {
        "error": "ID_NOT_FOUND",
        "officialResponse": null
      }
    }
  }
  """

@database
Scenario: GraphQL client delete an officialResponse
  Given I am logged in to graphql as admin
  And I send a GraphQL POST request:
  """
  {
    "query": "mutation ($input: DeleteOfficialResponseInput!) {
      deleteOfficialResponse(input: $input) {
        error
        id
      }
    }",
    "variables": {
      "input": {
        "id": "T2ZmaWNpYWxSZXNwb25zZTpvZmZpY2lhbFJlc3BvbnNlMTE="
      }
    }
  }
  """
  Then the JSON response should match:
  """
  {
    "data": {
      "deleteOfficialResponse": {
        "error": null,
        "id": "T2ZmaWNpYWxSZXNwb25zZTpvZmZpY2lhbFJlc3BvbnNlMTE="
      }
    }
  }
  """

Scenario: GraphQL client wants to delete an officialResponse but wrong id
  Given I am logged in to graphql as admin
  And I send a GraphQL POST request:
  """
  {
    "query": "mutation ($input: DeleteOfficialResponseInput!) {
      deleteOfficialResponse(input: $input) {
        error
        id
      }
    }",
    "variables": {
      "input": {
        "id": "wrongId"
      }
    }
  }
  """
  Then the JSON response should match:
  """
  {
    "data": {
      "deleteOfficialResponse": {
        "error": "ID_NOT_FOUND",
        "id": null
      }
    }
  }
  """

@database
Scenario: GraphQL client remove an author from an officialResponse
  Given I am logged in to graphql as admin
  And I send a GraphQL POST request:
  """
  {
    "query": "mutation ($input: UpdateOfficialResponseInput!) {
      updateOfficialResponse(input: $input) {
        error
        officialResponse {
          authors {
            id
          }
        }
      }
    }",
    "variables": {
      "input": {
        "id": "T2ZmaWNpYWxSZXNwb25zZTpvZmZpY2lhbFJlc3BvbnNlMjI=",
        "body": "osef",
        "isPublished": true,
        "authors": ["VXNlcjp1c2VyU3B5bA=="],
        "proposal": "UHJvcG9zYWw6cHJvcG9zYWxJZGYz"
      }
    }
  }
  """
  Then the JSON response should match:
  """
  {
    "data": {
      "updateOfficialResponse": {
        "error": null,
        "officialResponse": {
          "authors": [
            {
              "id": "VXNlcjp1c2VyU3B5bA=="
            }
          ]
        }
      }
    }
  }
  """
