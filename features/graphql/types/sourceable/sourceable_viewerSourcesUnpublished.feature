@sourceable_viewerSourcesUnpublished
Feature: Unpublished sources of an sourceable

@read-only
Scenario: User wants to get sources for an opinion
  Given I am logged in to graphql as user_not_confirmed_with_contributions
  And I send a GraphQL POST request:
  """
  {
    "query": "query ($opinionId: ID!) {
      opinion: node(id: $opinionId) {
          ... on Sourceable {
              viewerSourcesUnpublished(first: 100) {
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
            "viewerSourcesUnpublished": {
              "totalCount": 4,
              "edges": [
                {
                  "node": {
                    "id": @string@,
                    "published": false
                  }
                },
                @...@
              ]
            }
        }
    }
  }
  """
