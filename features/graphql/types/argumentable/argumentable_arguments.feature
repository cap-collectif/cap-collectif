@argumentable
Feature: Arguments of an argumentable

@read-only
Scenario: Anonymous wants to get arguments for an opinion
  Given I send a GraphQL POST request:
  """
  {
    "query": "query ($opinionId: ID!) {
      opinion: node(id: $opinionId) {
          ... on Argumentable {
              arguments(first: 5) {
                  totalCount
                  edges {
                      node {
                          id
                          type
                          published
                      }
                  }
              }
          }
      }
    }",
    "variables": {
      "opinionId": "opinion2"
    }
  }
  """
  Then the JSON response should match:
  """
  {
    "data": {
        "opinion": {
            "arguments": {
              "totalCount": 2,
              "edges": [
                {
                  "node": {
                    "id": @string@,
                    "type": @string@,
                    "published": true
                  }
                },
                @...@
              ]
            }
        }
    }
  }
  """

@read-only
Scenario: Anonymous wants to get all arguments including trashed ones for an opinion
  Given I send a GraphQL POST request:
  """
  {
    "query": "query ($opinionId: ID!) {
      opinion: node(id: $opinionId) {
          ... on Argumentable {
              arguments(first: 5, includeTrashed: true) {
                  totalCount
              }
          }
      }
    }",
    "variables": {
      "opinionId": "opinion2"
    }
  }
  """
  Then the JSON response should match:
  """
  {
    "data": {
        "opinion": {
            "arguments": {
              "totalCount": 3
            }
        }
    }
  }
  """

@read-only
Scenario: Anonymous wants to get arguments for a version
  Given I send a GraphQL POST request:
  """
  {
    "query": "query ($versionId: ID!) {
      version: node(id: $versionId) {
          ... on Argumentable {
              arguments(first: 5) {
                  totalCount
                  edges {
                      node {
                          id
                          type
                      }
                  }
              }
          }
      }
    }",
    "variables": {
      "versionId": "version1"
    }
  }
  """
  Then the JSON response should match:
  """
  {
    "data": {
        "version": {
            "arguments": {
              "totalCount": 3,
              "edges": [
                {
                  "node": {
                    "id": @string@,
                    "type": @string@
                  }
                },
                @...@
              ]
            }
        }
    }
  }
  """

@read-only
Scenario: Anonymous wants to get arguments filtered by type for an opinion
  Given I send a GraphQL POST request:
  """
  {
    "query": "query ($opinionId: ID!) {
      opinion: node(id: $opinionId) {
          ... on Argumentable {
              arguments(first: 5, type: FOR) {
                  totalCount
                  edges {
                      node {
                          id
                          type
                      }
                  }
              }
          }
      }
    }",
    "variables": {
      "opinionId": "opinion3"
    }
  }
  """
  Then the JSON response should match:
  """
  {
    "data": {
        "opinion": {
            "arguments": {
              "totalCount": @integer@,
              "edges": [
                {
                  "node": {
                    "id": @string@,
                    "type": "FOR"
                  }
                },
                @...@
              ]
            }
        }
    }
  }
  """
  And I send a GraphQL POST request:
  """
  {
    "query": "query ($opinionId: ID!) {
      opinion: node(id: $opinionId) {
          ... on Argumentable {
              arguments(first: 5, type: AGAINST) {
                  totalCount
                  edges {
                      node {
                          id
                          type
                      }
                  }
              }
          }
      }
    }",
    "variables": {
      "opinionId": "opinion3"
    }
  }
  """
  Then the JSON response should match:
  """
  {
    "data": {
        "opinion": {
            "arguments": {
              "totalCount": @integer@,
              "edges": [
                {
                  "node": {
                    "id": @string@,
                    "type": "AGAINST"
                  }
                },
                @...@
              ]
            }
        }
    }
  }
  """
