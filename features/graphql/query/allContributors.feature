@allContributors
Feature: allContributors

@read-only
Scenario: GraphQL admin want to get all of the users who are contributors.
  Given I am logged in to graphql as admin
  And I send a GraphQL POST request:
  """
  {
    "query": "{
      allContributors(first:5) {
        totalCount
        anonymousCount
        edges {
          node {
            id
          }
        }
      }
    }
    "
  }
  """
  Then the JSON response should match:
  """
  {
    "data": {
      "allContributors": {
        "totalCount": 84,
        "anonymousCount": 0,
        "edges": [
          {
            "node": {
              "id": "VXNlcjp1c2VyMQ=="
            }
          },
          {
            "node": {
              "id": "VXNlcjp1c2VyQWRtaW4="
            }
          },
          {
            "node": {
              "id": "VXNlcjp1c2VyMg=="
            }
          },
          {
            "node": {
              "id": "VXNlcjp1c2VyNQ=="
            }
          },
          {
            "node": {
              "id": "VXNlcjp1c2VyMw=="
            }
          }
        ]
      }
    }
  }
  """
