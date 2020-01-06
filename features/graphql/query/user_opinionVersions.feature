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
              {"node":{"id":"VmVyc2lvbjp2ZXJzaW9uMTY="}},
              {"node":{"id":"VmVyc2lvbjp2ZXJzaW9uMTk="}},
              {"node":{"id":"VmVyc2lvbjp2ZXJzaW9uMjA="}},
              {"node":{"id":"VmVyc2lvbjp2ZXJzaW9uMjE="}},
              {"node":{"id":"VmVyc2lvbjp2ZXJzaW9uMjI="}}
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
              {"node":{"id":"VmVyc2lvbjp2ZXJzaW9uNDU="}}
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
              {"node":{"id":"VmVyc2lvbjp2ZXJzaW9uMTA="}},
              {"node":{"id":"VmVyc2lvbjp2ZXJzaW9uMg=="}},
              {"node":{"id":"VmVyc2lvbjp2ZXJzaW9uMw=="}},
              {"node":{"id":"VmVyc2lvbjp2ZXJzaW9uNA=="}},
              {"node":{"id":"VmVyc2lvbjp2ZXJzaW9uNQ=="}}
            ]
          }
        }
      }
    }
  """
