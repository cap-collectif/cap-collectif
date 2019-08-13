Feature: Check user5's replies

@read-only
Scenario: user wants to see user5's replies and is not the author
  Given I am logged in to graphql as "conseilregional@test.com" with password "monsupermotdepassetropsafe"
  When I send a GraphQL POST request:
  """
  {
    "query": "query node ($userId: ID!){
      user: node(id: $userId) {
        ... on User {
          id
          replies{
            totalCount
            edges{
              node{
                createdAt
                author{
                  id
                  username
                }
                id
                private
              }
            }
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
        "replies": {
          "totalCount": 1,
          "edges": [
            {
              "node": {
                "createdAt": "2016-03-08 00:00:00",
                "author": {
                  "id": "VXNlcjp1c2VyNQ==",
                  "username": "user"
                },
                "id": "UmVwbHk6cmVwbHk4",
                "private": false
              }
            }
          ]
        }
      }
    }
  }
  """

@read-only
Scenario: author wants to see his replies
  Given I am logged in to graphql as admin
  When I send a GraphQL POST request:
  """
  {
    "query": "query node ($userId: ID!){
      user: node(id: $userId) {
        ... on User {
          id
          replies{
            totalCount
            edges{
              node{
                createdAt
                author{
                  id
                  username
                }
                id
                private
              }
            }
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
        "replies": {
          "totalCount": 2,
          "edges": [
            {
              "node": {
                "createdAt": "2016-03-08 00:00:00",
                "author": {
                  "id": "VXNlcjp1c2VyNQ==",
                  "username": "user"
                },
                "id": "UmVwbHk6cmVwbHk4",
                "private": false
              }
            },
            {
              "node": {
                "createdAt": "2019-03-20 00:00:00",
                "author": {
                  "id": "VXNlcjp1c2VyNQ==",
                  "username": "user"
                },
                "id": "UmVwbHk6cmVwbHlQcml2YXRl",
                "private": true
              }
            }
          ]
        }
      }
    }
  }
  """

@read-only
Scenario: admin wants to see user5's replies
  Given I am logged in to graphql as admin
  When I send a GraphQL POST request:
  """
  {
    "query": "query node ($userId: ID!){
      user: node(id: $userId) {
        ... on User {
          id
          replies{
            totalCount
            edges{
              node{
                createdAt
                author{
                  id
                  username
                }
                id
                private
              }
            }
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
        "replies": {
          "totalCount": 2,
          "edges": [
            {
              "node": {
                "createdAt": "2016-03-08 00:00:00",
                "author": {
                  "id": "VXNlcjp1c2VyNQ==",
                  "username": "user"
                },
                "id": "UmVwbHk6cmVwbHk4",
                "private": false
              }
            },
            {
              "node": {
                "createdAt": "2019-03-20 00:00:00",
                "author": {
                  "id": "VXNlcjp1c2VyNQ==",
                  "username": "user"
                },
                "id": "UmVwbHk6cmVwbHlQcml2YXRl",
                "private": true
              }
            }
          ]
        }
      }
    }
  }
  """
