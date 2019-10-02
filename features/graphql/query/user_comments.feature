@user_comments
Feature: Get visible user's comments.

@read-only
Scenario: GraphQL user wants to get comments of a project with custom access that belong to a user in the same user group.
  Given I am logged in to graphql as "saitama@cap-collectif.com" with password "mob?"
  And I send a GraphQL POST request:
  """
    {
      "query": "query getCommentsByAuthorViewerCansee($userId: ID!, $after: String) {
        user: node(id: $userId) {
          ... on User {
            comments(after: $after, first: 5) {
              edges {
                node {
                  _id
                  commentable {
                    ... on Proposal {
                      project {
                        visibility
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }",
      "variables": {
        "userId": "VXNlcjp1c2VyMg==",
        "after": "YToyOntpOjA7aToxNTY5ODM5NTQyMDAwO2k6MTtzOjEzOiJldmVudENvbW1lbnQ5Ijt9"
      }
    }
  """
  Then the JSON response should match:
  """
  {
     "data":{
        "user":{
           "comments":{
              "edges":[
                 {
                    "node":{
                       "_id":"proposalComment71",
                       "commentable":{
                          "project":{
                             "visibility":"CUSTOM"
                          }
                       }
                    }
                 },
                 {
                    "node":{
                       "_id":"proposalComment4",
                       "commentable":{
                          "project":{
                             "visibility":"PUBLIC"
                          }
                       }
                    }
                 },
                 {
                    "node":{
                       "_id":"proposalComment3",
                       "commentable":{
                          "project":{
                             "visibility":"PUBLIC"
                          }
                       }
                    }
                 },
                 {
                    "node":{
                       "_id":"proposalComment2",
                       "commentable":{
                          "project":{
                             "visibility":"PUBLIC"
                          }
                       }
                    }
                 },
                 {
                    "node":{
                       "_id":"proposalComment1",
                       "commentable":{
                          "project":{
                             "visibility":"PUBLIC"
                          }
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
Scenario: GraphQL super admin wants to get visible comments of a user.
  Given I am logged in to graphql as super admin
  And I send a GraphQL POST request:
  """
    {
      "query": "query getCommentsByAuthorViewerCansee($userId: ID!, $after: String) {
        user: node(id: $userId) {
          ... on User {
            comments(after: $after, first: 5) {
              edges {
                node {
                  _id
                  commentable {
                    ... on Proposal {
                      project {
                        visibility
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }",
      "variables": {
        "userId": "VXNlcjp1c2VyQWRtaW4",
        "after": "YToyOntpOjA7aToxNDg1OTEwNjgwMDAwO2k6MTtzOjE3OiJwcm9wb3NhbENvbW1lbnQ1OCI7fQ=="
      }
    }
  """
  Then the JSON response should match:
  """
    {
      "data": {
        "user": {
          "comments": {
            "edges": [
              {
                "node": {
                  "_id": "proposalComment57",
                  "commentable": {
                    "project": {
                      "visibility": "CUSTOM"
                    }
                  }
                }
              },
              {
                "node": {
                  "_id": "proposalComment56",
                  "commentable": {
                    "project": {
                      "visibility": "CUSTOM"
                    }
                  }
                }
              },
              {
                "node": {
                  "_id": "proposalComment27",
                  "commentable": {
                    "project": {
                      "visibility": "ME"
                    }
                  }
                }
              },
              {
                "node": {
                  "_id": "proposalComment26",
                  "commentable": {
                    "project": {
                      "visibility": "ME"
                    }
                  }
                }
              },
              {
                "node": {
                  "_id": "proposalComment25",
                  "commentable": {
                    "project": {
                      "visibility": "ME"
                    }
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
Scenario: GraphQL anonymous want to get visible comments of a user
  And I send a GraphQL POST request:
  """
    {
      "query": "query getPublicCommentsByAuthor($userId: ID!, $after: String) {
        user: node(id: $userId) {
          ... on User {
            comments(after: $after, first: 5) {
              edges {
                node {
                  _id
                  commentable {
                    ... on Proposal {
                      project {
                        visibility
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }",
      "variables": {
        "userId": "VXNlcjp1c2VyMQ==",
        "after": "YToyOntpOjA7aToxNTcwMDIyNTAzMDAwO2k6MTtzOjE0OiJldmVudENvbW1lbnQyOCI7fQ=="
      }
    }
  """
  Then the JSON response should match:
  """
    {
      "data": {
        "user": {
          "comments": {
            "edges": [
              {
                "node": {
                  "_id": "eventComment29",
                  "commentable": {}
                }
              },
              {
                "node": {
                  "_id": "proposalComment55",
                  "commentable": {
                    "project": {
                      "visibility": "PUBLIC"
                    }
                  }
                }
              },
              {
                "node": {
                  "_id": "proposalComment54",
                  "commentable": {
                    "project": {
                      "visibility": "PUBLIC"
                    }
                  }
                }
              },
              {
                "node": {
                  "_id": "proposalComment53",
                  "commentable": {
                    "project": {
                      "visibility": "PUBLIC"
                    }
                  }
                }
              },
              {
                "node": {
                  "_id": "proposalComment52",
                  "commentable": {
                    "project": {
                      "visibility": "PUBLIC"
                    }
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
Scenario: GraphQL admin wants to get visible comments of a user.
  Given I am logged in to graphql as "admin@cap-collectif.com" with password "admin"
  And I send a GraphQL POST request:
  """
    {
      "query": "query getCommentsByAuthorViewerCanSee($userId: ID!, $after: String) {
        user: node(id: $userId) {
          ... on User {
            comments(after: $after, first: 5) {
              edges {
                node {
                  _id
                  commentable {
                    ... on Proposal {
                      project {
                        visibility
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }",
      "variables": {
        "userId": "VXNlcjp1c2VyMg==",
        "after": "YToyOntpOjA7aToxNTY5ODM5NTQyMDAwO2k6MTtzOjEzOiJldmVudENvbW1lbnQ5Ijt9"
      }
    }
  """
  Then the JSON response should match:
  """
    {
      "data": {
        "user": {
          "comments": {
            "edges": [
              {
                "node": {
                  "_id": "proposalComment42",
                  "commentable": {
                    "project": {
                      "visibility": "ADMIN"
                    }
                  }
                }
              },
              {
                "node": {
                  "_id": "proposalComment41",
                  "commentable": {
                    "project": {
                      "visibility": "ADMIN"
                    }
                  }
                }
              },
              {
                "node": {
                  "_id": "proposalComment40",
                  "commentable": {
                    "project": {
                      "visibility": "ADMIN"
                    }
                  }
                }
              },
              {
                "node": {
                  "_id": "proposalComment39",
                  "commentable": {
                    "project": {
                      "visibility": "ADMIN"
                    }
                  }
                }
              },
              {
                "node": {
                  "_id": "proposalComment38",
                  "commentable": {
                    "project": {
                      "visibility": "ADMIN"
                    }
                  }
                }
              }
            ]
          }
        }
      }
    }
  """
