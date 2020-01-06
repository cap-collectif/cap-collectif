@opinion_viewerVersionsUnpublished
Feature: Versions of an opinion

@read-only
Scenario: Anonymous wants to get viewerVersionsUnpublished for an opinion
  Given I am logged in to graphql as user_not_confirmed_with_contributions
  And I send a GraphQL POST request:
  """
  {
    "query": "query ($opinionId: ID!) {
      opinion: node(id: $opinionId) {
          ... on Opinion {
              viewerVersionsUnpublished(first: 5) {
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
            "viewerVersionsUnpublished": {
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
  