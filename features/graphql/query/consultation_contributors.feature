@consultation
Feature: Consultation contributors

Scenario: GraphQL client want to get the list of contributors
  Given I send a GraphQL POST request:
  """
  {
    "query": "query node ($consultation: ID!){
      consultation: node(id: $consultation) {
        ... on Consultation {
          contributors(first: 5) {
            totalCount
            pageInfo {
              hasNextPage
              endCursor
            }
            edges {
              node {
                id
              }
            }
          }
        }
      }
    }",
    "variables": {
      "consultation": "cstep1"
    }
  }
  """
  Then the JSON response should match:
  """
  {
    "data": {
      "consultation": {
        "contributors": {
          "totalCount": 24,
          "pageInfo": {
            "hasNextPage": true,
            "endCursor": "YXJyYXljb25uZWN0aW9uOjQ="
          },
          "edges": [
            {
              "node": {
                "id": @string@
              }
            },
            @...@
          ]
        }
      }
    }
  }
  """
