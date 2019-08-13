Feature: Check user5's sources

@read-only
Scenario: admin wants to see user5's sources
  Given I am logged in to graphql as admin
  When I send a GraphQL POST request:
  """
  {
    "query": "query node ($userId: ID!){
      user: node(id: $userId) {
        ... on User {
          id
          sources{
            totalCount
          }
        }
      }
    }",
    "variables": {
      "userId": "VXNlcjp1c2VyNQ=="
    }
  }
  """
  Then the JSON response should match:
  """
  {
    "data": {
      "user": {
        "id": "VXNlcjp1c2VyNQ==",
         "sources": {
          "totalCount": 3
         }
      }
    }
  }
   """
