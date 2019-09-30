@opinion_versions
Feature: Versions of an opinion

@read-only
Scenario: Anonymous wants to get versions for an opinion
  Given I send a GraphQL POST request:
  """
  {
    "query": "query ($opinionId: ID!) {
      opinion: node(id: $opinionId) {
          ... on Opinion {
              versions(first: 5) {
                  totalCount
                  edges {
                      node {
                          id
                          published
                      }
                  }
              }
          }
      }
    }",
    "variables": {
      "opinionId": "opinion57"
    }
  }
  """
  Then the JSON response should match:
  """
  {
    "data": {
        "opinion": {
            "versions": {
              "totalCount": 3,
              "edges": [
                {
                  "node": {
                    "id": @string@,
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
  