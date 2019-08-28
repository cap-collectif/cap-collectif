Feature: Get visible user's proposals

@read-only
Scenario: GraphQL admin wants to get visible proposals of a user.
  Given I am logged in to graphql as "admin@cap-collectif.com" with password "admin"
  And I send a GraphQL POST request:
  """
    {
      "query": "query getProposalsByAuthorViewerCanSee($userId: ID!) {
        user: node(id: $userId) {
          ... on User {
            proposals(first: 5) {
              edges {
                node {
                  project {
                    _id
                    visibility
                  }
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
                    "_id": "project6",
                    "visibility": "PUBLIC"
                  }
                }
              },
              {
                "node": {
                  "project": {
                    "_id": "ProjectAccessibleForAdminOnly",
                    "visibility": "ADMIN"
                  }
                }
              }
            ]
          }
        }
      }
    }
  """

@read-only
Scenario: GraphQL super admin wants to get visible proposals of a user
  Given I am logged in to graphql as super admin
  And I send a GraphQL POST request:
  """
    {
      "query": "query getProposalsByAuthorViewerCanSee($userId: ID!, $after: String) {
        user: node(id: $userId) {
          ... on User {
            proposals(after: $after, first: 5) {
              edges {
                node {
                  project {
                    _id
                    visibility
                  }
                }
              }
            }
          }
        }
      }",
      "variables": {
        "userId": "VXNlcjp1c2VyQWRtaW4",
        "after": "YXJyYXljb25uZWN0aW9uOjM="
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
                    "_id": "ProjectAccessibleForAdminOnly",
                    "visibility": "ADMIN"
                  }
                }
              },
              {
                "node": {
                  "project": {
                    "_id": "ProjectAccessibleForMeOnly",
                    "visibility": "ME"
                  }
                }
              },
              {
                "node": {
                  "project": {
                    "_id": "ProjectAccessibleForMeOnly",
                    "visibility": "ME"
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
              }
            ]
          }
        }
      }
    }
  """

@read-only
Scenario: GraphQL anonymous want to get visible proposals of a user
  And I send a GraphQL POST request:
  """
    {
      "query": "query getProposalsByAuthorViewerCanSee($userId: ID!, $after: String) {
        user: node(id: $userId) {
          ... on User {
            proposals(after: $after, first: 5) {
              edges {
                node {
                  project {
                    _id
                    visibility
                  }
                }
              }
            }
          }
        }
      }",
      "variables": {
        "userId": "VXNlcjp1c2VyQWRtaW4",
        "after": "YXJyYXljb25uZWN0aW9uOjI="
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

@read-only
Scenario: GraphQL user wants to get proposals of a project with custom acces that belong to a user in the same user group.
  Given I am logged in to graphql as "saitama@cap-collectif.com" with password "mob?"
  And I send a GraphQL POST request:
  """
    {
      "query": "query getProposalsByAuthorViewerCanSee($userId: ID!, $after: String) {
        user: node(id: $userId) {
          ... on User {
            proposals(after: $after, first: 5) {
              edges {
                node {
                  project {
                    _id
                    visibility
                  }
                }
              }
            }
          }
        }
      }",
      "variables": {
        "userId": "VXNlcjp1c2VyMQ==",
        "after": "YXJyYXljb25uZWN0aW9uOjY0"
      }
    }
  """
  Then the JSON response should match:
  """
  {
     "data":{
        "user":{
           "proposals":{
              "edges":[
                 {
                    "node":{
                       "project":{
                          "_id":"project6",
                          "visibility":"PUBLIC"
                       }
                    }
                 },
                 {
                    "node":{
                       "project":{
                          "_id":"project15",
                          "visibility":"PUBLIC"
                       }
                    }
                 },
                 {
                    "node":{
                       "project":{
                          "_id":"project15",
                          "visibility":"PUBLIC"
                       }
                    }
                 },
                 {
                    "node":{
                       "project":{
                          "_id":"project15",
                          "visibility":"PUBLIC"
                       }
                    }
                 },
                 {
                    "node":{
                       "project":{
                          "_id":"project21",
                          "visibility":"PUBLIC"
                       }
                    }
                 }
              ]
           }
        }
     }
  }
  """
