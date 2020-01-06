Feature: Get visible user's opinion versions

@read-only
Scenario: GraphQL admin wants to get private opinion versions of a user.
  Given I am logged in to graphql as "admin@test.com" with password "admin"
  And I send a GraphQL POST request:
  """
    {
      "query": "query getOpinionVersionByAuthorViewerCanSee($userId: ID!) {
        user: node(id: $userId) {
          ... on User {
            opinionVersions(first: 5) {
              totalCount
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
        "userId": "VXNlcjp1c2VyQWRtaW4"
      }
    }
  """
  Then the JSON response should match:
  """
    {
      "data":{
        "user":{
          "opinionVersions":{
            "totalCount":28,
            "edges":[
              {"node":{"id":"version16"}},
              {"node":{"id":"version19"}},
              {"node":{"id":"version20"}},
              {"node":{"id":"version21"}},
              {"node":{"id":"version22"}}
            ]
          }
        }
      }
    }
  """

@read-only
Scenario: GraphQL anonymous wants to get private opinion versions of a user.
  Given I send a GraphQL POST request:
  """
    {
      "query": "query getOpinionVersionByAuthorViewerCanSee($userId: ID!) {
        user: node(id: $userId) {
          ... on User {
            opinionVersions(first: 5) {
              totalCount
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
        "userId": "VXNlcjp1c2VyQWRtaW4"
      }
    }
  """
  Then the JSON response should match:
  """
    {
      "data":{
        "user":{
          "opinionVersions":{
            "totalCount":1,
            "edges":[
              {"node":{"id":"version45"}}
            ]
          }
        }
      }
    }
  """

@read-only
Scenario: GraphQL anonymous wants to get public opinion versions of a user.
  Given I send a GraphQL POST request:
  """
    {
      "query": "query getOpinionVersionByAuthorViewerCanSee($userId: ID!) {
        user: node(id: $userId) {
          ... on User {
            opinionVersions(first: 5) {
              totalCount
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
        "userId": "VXNlcjp1c2VyMg"
      }
    }
  """
  Then the JSON response should match:
  """
    {
      "data":{
        "user":{
          "opinionVersions":{
            "totalCount":9,
            "edges":[
              {"node":{"id":"version10"}},
              {"node":{"id":"version2"}},
              {"node":{"id":"version3"}},
              {"node":{"id":"version4"}},
              {"node":{"id":"version5"}}
            ]
          }
        }
      }
    }
  """