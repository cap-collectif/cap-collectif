@dev
Feature: Get visible user's arguments

@read-only
Scenario: GraphQL admin wants to get arguments proposals of a user.
  Given I am logged in to graphql as "admin@test.com" with password "admin"
  And I send a GraphQL POST request:
  """
    {
      "query": "query getProposalsByAuthorViewerCanSee($userId: ID!) {
        user: node(id: $userId) {
          ... on User {
            arguments {
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
          "arguments":{
            "edges":[
              {"node":{"id":"argument2"}},
              {"node":{"id":"argument251"}},
              {"node":{"id":"argument252"}}
            ]
          }
        }
      }
    }
  """

@read-only
Scenario: GraphQL super admin wants to get visible arguments of a user
  Given I am logged in to graphql as super admin
  And I send a GraphQL POST request:
  """
    {
      "query": "query getProposalsByAuthorViewerCanSee($userId: ID!) {
        user: node(id: $userId) {
          ... on User {
            arguments {
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
  {"data":{"user":{"arguments":{"edges":[{"node":{"id":"argument2"}},{"node":{"id":"argument251"}},{"node":{"id":"argument252"}}]}}}}
  """

@read-only
Scenario: GraphQL anonymous want to get visible arguments of a user
  And I send a GraphQL POST request:
  """
    {
      "query": "query getProposalsByAuthorViewerCanSee($userId: ID!) {
        user: node(id: $userId) {
          ... on User {
            arguments {
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
      "data": {
        "user": {
          "proposals": {
            "edges": [
              {
                "node": {
                  "project": {
                    "_id": "project6",
                    "visibility": "PUBLIC"
                  }
                }
              },
              {
                "node": {
                  "project": {
                    "_id": "project7",
                    "visibility": "PUBLIC"
                  }
                }
              },
              {
                "node": {
                  "project": {
                    "_id": "project6",
                    "visibility": "PUBLIC"
                  }
                }
              },
              {
                "node": {
                  "project": {
                    "_id": "project6",
                    "visibility": "PUBLIC"
                  }
                }
              },
              {
                "node": {
                  "project": {
                    "_id": "project7",
                    "visibility": "PUBLIC"
                  }
                }
              }
            ]
          }
        }
      }
    }
  """