@argumentable_viewerArgumentsUnpublished
Feature: Unpublished arguments of an argumentable

@read-only
Scenario: User wants to get arguments for an opinion
  Given I am logged in to graphql as user_not_confirmed_with_contributions
  And I send a GraphQL POST request:
  """
  {
    "query": "query ($opinionId: ID!) {
      opinion: node(id: $opinionId) {
          ... on Argumentable {
              viewerArgumentsUnpublished(first: 100) {
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
            "viewerArgumentsUnpublished": {
              "totalCount": 5,
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
