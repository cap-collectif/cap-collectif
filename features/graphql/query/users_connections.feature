Feature: Check lbrunet's connections

@read-only @database
Scenario: lbrunet wants to see lbrunet's successful connections
  Given I am logged in to graphql as admin
  When I send a GraphQL POST request:
  """
  {
    "query": "query node ($userId: ID!){
      connection: node(id: $userId) {
        ... on User {
          connectionAttempt(success: true){
            totalCount
            edges{
              node{
                user{
                  id
                }
                ipAddress
                datetime
                email
              }
            }
          }
        }
      }
    }",
    "variables": {
      "userId": "VXNlcjp1c2VyMQ=="
    }
  }
  """
  Then the JSON response should match:
  """
  {
    "data": {
      "connection": {
        "connectionAttempt": {
          "totalCount": 1,
          "edges": [
            {
              "node": {
                "userId": "VXNlcjp1c2VyMQ==",
                "ipAddress": "192.168.64.1",
                "datetime": "2017-01-01 00:06:00",
                "email": "lbrunet@jolicode.com"
              }
            }
          ]
        }
      }
    }
  }
  """

@read-only @database
Scenario: lbrunet wants to see lbrunet's unsuccessful connections
  Given I am logged in to graphql as "lbrunet@jolicode.com" with password "toto"
  When I send a GraphQL POST request:
  """
  {
    "query": "query node ($userId: ID!, $email: String){
      connection: node(id: $userId) {
        ... on User {
          connectionAttempt(email: $email, success: false){
            totalCount
            edges{
              node{
                user{
                  id
                }
                ipAddress
                datetime
                email
              }
            }
          }
        }
      }
    }",
    "variables": {
      "userId": "VXNlcjp1c2VyMQ==",
      "email": "lbrunet@jolicode.com"
    }
  }
  """
  Then the JSON response should match:
  """
  {
    "data": {
      "connection": {
        "connectionAttempt": {
          "totalCount": 5,
          "edges": [
            {
              "node": {
                "userId": null,
                "ipAddress": "192.168.64.1",
                "datetime": "2017-01-01 00:01:00",
                "email": "lbrunet@jolicode.com"
              }
            },
            {
              "node": {
                "userId": null,
                "ipAddress": "192.168.64.1",
                "datetime": "2017-01-01 00:02:00",
                "email": "lbrunet@jolicode.com"
              }
            },
            {
              "node": {
                "userId": null,
                "ipAddress": "192.168.64.1",
                "datetime": "2017-01-01 00:03:00",
                "email": "lbrunet@jolicode.com"
              }
            },
            {
              "node": {
                "userId": null,
                "ipAddress": "192.168.64.1",
                "datetime": "2017-01-01 00:04:00",
                "email": "lbrunet@jolicode.com"
              }
            },
            {
              "node": {
                "userId": null,
                "ipAddress": "192.168.64.1",
                "datetime": "2017-01-01 00:05:00",
                "email": "lbrunet@jolicode.com"
              }
            }
          ]
        }
      }
    }
  }
  """
