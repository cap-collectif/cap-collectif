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
        "after": "YToyOntpOjA7aToxNTE4OTEyMDAwMDAwO2k6MTtzOjEzOiJldmVudENvbW1lbnQyIjt9"
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
                "_id": "eventComment2",
                "commentable": {}
              }
            },
            {
              "node": {
                "_id": "proposalComment71",
                "commentable": {
                  "project": {
                    "visibility": "CUSTOM"
                  }
                }
              }
            },
            {
              "node": {
                "_id": "proposalComment4",
                "commentable": {
                  "project": {
                    "visibility": "PUBLIC"
                  }
                }
              }
            },
            {
              "node": {
                "_id": "proposalComment3",
                "commentable": {
                  "project": {
                    "visibility": "PUBLIC"
                  }
                }
              }
            },
            {
              "node": {
                "_id": "proposalComment2",
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
                "_id": "proposalComment60",
                "commentable": {
                  "project": {
                    "visibility": "CUSTOM"
                  }
                }
              }
            },
            {
              "node": {
                "_id": "proposalComment59",
                "commentable": {
                  "project": {
                    "visibility": "CUSTOM"
                  }
                }
              }
            },
            {
              "node": {
                "_id": "proposalComment58",
                "commentable": {
                  "project": {
                    "visibility": "CUSTOM"
                  }
                }
              }
            },
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
        "after": "YToyOntpOjA7aToxNTIwNTUzNjAwMDAwO2k6MTtzOjE0OiJldmVudENvbW1lbnQyMSI7fQ=="
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
                "_id": "eventComment21",
                "commentable": {}
              }
            },
            {
              "node": {
                "_id": "eventComment20",
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
        "after": "YToyOntpOjA7aToxNTE4OTEyMDAwMDAwO2k6MTtzOjEzOiJldmVudENvbW1lbnQyIjt9"
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
                "_id": "eventComment2",
                "commentable": {}
              }
            },
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
            }
          ]
        }
      }
    }
  }
  """
