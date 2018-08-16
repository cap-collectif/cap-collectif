@sourceable_sources
Feature: Sources of an sourceable

@read-only
Scenario: User wants to get sources for an opinion
  Given I am logged in to graphql as user
  And I send a GraphQL POST request:
  """
  {
    "query": "query ($opinionId: ID!) {
      opinion: node(id: $opinionId) {
          ... on Sourceable {
              sources(first: 100) {
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
      "opinionId": "opinion3"
    }
  }
  """
  Then the JSON response should match:
  """
  {
    "data": {
        "opinion": {
            "sources": {
              "totalCount": 6,
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
