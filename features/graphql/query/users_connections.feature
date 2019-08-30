Feature: Check lbrunet's connections

@read-only
Scenario: lbrunet wants to see lbrunet's successful connections
  Given I am logged in to graphql as "lbrunet@jolicode.com" with password "toto"
  When I send a GraphQL POST request:
  """
  {
    "query": "query test ($userId: String){
      connectionAttempt(userId: $userId){
      totalCount
        edges{
          node{
            userId
            ipAddress
            datetime
            email
          }
        }
      }
    }",
    "variables": {
      "userId": "VXNlcjpsYnJ1bmV0"
    }
  }
  """
  Then the JSON response should match:
  """
  {
    "data": {
      "connectionAttempt": {
        "totalCount": 1,
        "edges": [
          {
            "node": {
              "userId": "VXNlcjpsYnJ1bmV0",
              "ipAddress": "192.168.64.1",
              "datetime": "2017-01-01 00:06:00",
              "email": "lbrunet@jolicode.com"
            }
          }
        ]
      }
    }
  }
  """

@read-only
Scenario: lbrunet wants to see lbrunet's unsuccessful connections
  Given I am logged in to graphql as "lbrunet@jolicode.com" with password "toto"
  When I send a GraphQL POST request:
  """
  {
    "query": "query test ($email: String){
      connectionAttempt(email: $email, success: false){
        totalCount
        edges{
          node{
            userId
            ipAddress
            datetime
            email
          }
        }
      }
    }",
    "variables": {
      "email": "lbrunet@jolicode.com"
    }
  }
  """
  Then the JSON response should match:
  """
  {
    "data": {
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
  """
