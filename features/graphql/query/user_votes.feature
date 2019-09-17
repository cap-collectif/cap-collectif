@user_votes
Feature: Get user's visible votes.

@read-only @randomly-failing
Scenario: GraphQL user wants to get votes of an object related to a project with custom access that belong to a user in the same user group
  Given I am logged in to graphql as "saitama@cap-collectif.com" with password "mob?"
  And I send a GraphQL POST request:
  """
    {
      "query": "query getVotesByAuthorViewerCanSee($userId: ID!, $after: String) {
        user: node(id: $userId) {
          ... on User {
            votes(first: 8, after: $after) {
              edges {
                node {
                  related {
                    ... on Source {
                      related {
                        ... on Opinion {
                        	nullable: project {
                          	_id
                            visibility
                          }
                        }
                      }
                    }
                    ... on Proposal {
                      id
                      project {
                        _id
                        visibility
                      }
                    }
                    ... on Opinion {
                      id
                       nullable: project {
                        _id
                        visibility
                      }
                    }
                    ... on Argument {
                      id
                        related {
                        ... on Opinion {
                          id
                          nullable: project {
                            _id
                            visibility
                          }
                        }
                      }
                    }
                    ... on Version {
                      id
                      nullable: project {
                        _id
                        visibility
                      }
                    }
                    ... on Comment {
                        _id
                        commentable {
                        ...on Proposal {
                          project {
                            _id
                            visibility
                          }
                        }
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
        "userId": "VXNlcjp1c2VyQWRtaW4=",
        "after": "YXJyYXljb25uZWN0aW9uOjc="
      }
    }
  """
  Then the JSON response should match:
  """
  {
    "data": {
      "user": {
        "votes": {
          "edges": [
            {
              "node": {
                "related": {
                  "id": "UHJvcG9zYWw6cHJvcG9zYWwy",
                  "project": {
                    "_id": "project6",
                    "visibility": "PUBLIC"
                  }
                }
              }
            },
            {
              "node": {
                "related": {
                  "id": "opinion3",
                  "nullable": {
                    "_id": "project1",
                    "visibility": "PUBLIC"
                  }
                }
              }
            },
            {
              "node": {
                "related": {
                  "id": "opinion57",
                  "nullable": {
                    "_id": "project5",
                    "visibility": "PUBLIC"
                  }
                }
              }
            },
            {
              "node": {
                "related": {
                  "id": "opinion104",
                  "nullable": {
                    "_id": "ProjectWithCustomAccess",
                    "visibility": "CUSTOM"
                  }
                }
              }
            },
            {
              "node": {
                "related": {
                  "id": "argument255",
                  "related": {
                    "id": "opinion104",
                    "nullable": {
                      "_id": "ProjectWithCustomAccess",
                      "visibility": "CUSTOM"
                    }
                  }
                }
              }
            },
            {
              "node": {
                "related": {
                  "id": "version2",
                  "nullable": {
                    "_id": "project5",
                    "visibility": "PUBLIC"
                  }
                }
              }
            },
            {
              "node": {
                "related": {
                  "_id": "eventComment4",
                  "commentable": {}
                }
              }
            },
            {
              "node": {
                "related": {
                  "_id": "proposalComment4",
                  "commentable": {
                    "project": {
                      "_id": "project6",
                      "visibility": "PUBLIC"
                    }
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

@read-only @randomly-failing
Scenario: GraphQL super admin wants to get visible votes of a user.
  Given I am logged in to graphql as super admin
  And I send a GraphQL POST request:
  """
    {
      "query": "query getVotesByAuthorViewerCanSee($userId: ID!, $after: String) {
        user: node(id: $userId) {
          ... on User {
            votes(first: 6, after: $after) {
              edges {
                node {
                  related {
                    ... on Source {
                      id
                      related {
                        ... on Opinion {
                        	nullable: project {
                          	_id
                            visibility
                          }
                        }
                      }
                    }
                    ... on Proposal {
                      id
                      project {
                        _id
                        visibility
                      }
                    }
                    ... on Opinion {
                      id
                       nullable: project {
                        _id
                        visibility
                      }
                    }
                    ... on Argument {
                      id
                        related {
                        ... on Opinion {
                          id
                          nullable: project {
                            _id
                            visibility
                          }
                        }
                      }
                    }
                    ... on Version {
                      id
                      nullable: project {
                        _id
                        visibility
                      }
                    }
                    ... on Comment {
                        _id
                        commentable {
                        ...on Proposal {
                          project {
                            _id
                            visibility
                          }
                        }
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
        "after": "YXJyYXljb25uZWN0aW9uOjEx"
      }
    }
  """
  Then the JSON response should match:
  """
  {
    "data": {
      "user": {
        "votes": {
          "edges": [
            {
              "node": {
                "related": {
                  "id": "opinion104",
                  "nullable": {
                    "_id": "ProjectWithCustomAccess",
                    "visibility": "CUSTOM"
                  }
                }
              }
            },
            {
              "node": {
                "related": {
                  "id": "argument255",
                  "related": {
                    "id": "opinion104",
                    "nullable": {
                      "_id": "ProjectWithCustomAccess",
                      "visibility": "CUSTOM"
                    }
                  }
                }
              }
            },
            {
              "node": {
                "related": {
                  "id": "version2",
                  "nullable": {
                    "_id": "project5",
                    "visibility": "PUBLIC"
                  }
                }
              }
            },
            {
              "node": {
                "related": {
                  "_id": "eventComment4",
                  "commentable": {}
                }
              }
            },
            {
              "node": {
                "related": {
                  "_id": "proposalComment4",
                  "commentable": {
                    "project": {
                      "_id": "project6",
                      "visibility": "PUBLIC"
                    }
                  }
                }
              }
            },
            {
              "node": {
                "related": {
                  "id": "version18",
                  "nullable": {
                    "_id": "ProjectWithCustomAccess",
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
Scenario: GraphQL anonymous want to get visible votes of a user
  And I send a GraphQL POST request:
  """
    {
      "query": "query getPublicVotesByAuthor($userId: ID!) {
        user: node(id: $userId) {
          ... on User {
            votes(first: 5) {
              edges {
                node {
                  related {
                    ...on Source {
                      id
                      related {
                        ...on Opinion {
                          id
                          nullable: project{
                            visibility
                          }
                        }
                      }
                    }
                    ... on Proposal {
                      id
                      project {
                        _id
                        visibility
                      }
                    }
                    ... on Opinion {
                      id
                       nullable: project {
                        _id
                        visibility
                      }
                    }
                    ... on Argument {
                      id
                        related {
                        ... on Opinion {
                          id
                          nullable: project {
                            _id
                            visibility
                          }
                        }
                      }
                    }
                    ... on Version {
                      id
                      nullable: project {
                        _id
                        visibility
                      }
                    }
                    ... on Comment {
                        _id
                        commentable {
                        ...on Proposal {
                          project {
                            _id
                            visibility
                          }
                        }
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
        "userId": "VXNlcjp1c2VyMg=="
      }
    }
  """
  Then the JSON response should match:
  """
  {
    "data": {
      "user": {
        "votes": {
          "edges": [
            {
              "node": {
                "related": {
                  "id": "opinion83",
                  "nullable": {
                    "_id": "project2",
                    "visibility": "PUBLIC"
                  }
                }
              }
            },
            {
              "node": {
                "related": {
                  "id": "UHJvcG9zYWw6cHJvcG9zYWwxNA==",
                  "project": {
                    "_id": "project9",
                    "visibility": "PUBLIC"
                  }
                }
              }
            },
            {
              "node": {
                "related": {
                  "id": "UHJvcG9zYWw6cHJvcG9zYWwx",
                  "project": {
                    "_id": "project6",
                    "visibility": "PUBLIC"
                  }
                }
              }
            },
            {
              "node": {
                "related": {
                  "id": "opinion57",
                  "nullable": {
                    "_id": "project5",
                    "visibility": "PUBLIC"
                  }
                }
              }
            },
            {
              "node": {
                "related": {
                  "id": "argument1",
                  "related": {
                    "id": "opinion2",
                    "nullable": {
                      "_id": "project1",
                      "visibility": "PUBLIC"
                    }
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

@read-only @randomly-failing
Scenario: GraphQL super admin wants to get visible votes of a user.
  Given I am logged in to graphql as "admin@cap-collectif.com" with password "admin"
  And I send a GraphQL POST request:
  """
    {
      "query": "query getVotesByAuthorViewerCanSee($userId: ID!, $after: String) {
        user: node(id: $userId) {
          ... on User {
            votes(first: 8, after: $after) {
              edges {
                node {
                  related {
                    ... on Source {
                      related {
                        ... on Opinion {
                          nullable: project {
                            _id
                            visibility
                          }
                        }
                      }
                    }
                    ... on Proposal {
                      id
                      project {
                        _id
                        visibility
                      }
                    }
                    ... on Opinion {
                      id
                       nullable: project {
                        _id
                        visibility
                      }
                    }
                    ... on Argument {
                      id
                        related {
                        ... on Opinion {
                          id
                          nullable: project {
                            _id
                            visibility
                          }
                        }
                      }
                    }
                    ... on Version {
                      id
                      nullable: project {
                        _id
                        visibility
                      }
                    }
                    ... on Comment {
                        _id
                        commentable {
                        ...on Proposal {
                          project {
                            _id
                            visibility
                          }
                        }
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
        "after": "YXJyYXljb25uZWN0aW9uOjI="
      }
    }
  """
  Then the JSON response should match:
  """
  {
    "data": {
      "user": {
        "votes": {
          "edges": [
            {
              "node": {
                "related": {
                  "id": "opinion57",
                  "nullable": {
                    "_id": "project5",
                    "visibility": "PUBLIC"
                  }
                }
              }
            },
            {
              "node": {
                "related": {
                  "id": "opinion102",
                  "nullable": {
                    "_id": "ProjectAccessibleForAdminOnly",
                    "visibility": "ADMIN"
                  }
                }
              }
            },
            {
              "node": {
                "related": {
                  "id": "argument1",
                  "related": {
                    "id": "opinion2",
                    "nullable": {
                      "_id": "project1",
                      "visibility": "PUBLIC"
                    }
                  }
                }
              }
            },
            {
              "node": {
                "related": {
                  "id": "argument254",
                  "related": {
                    "id": "opinion103",
                    "nullable": {
                      "_id": "ProjectAccessibleForAdminOnly",
                      "visibility": "ADMIN"
                    }
                  }
                }
              }
            },
            {
              "node": {
                "related": {
                  "id": "version2",
                  "nullable": {
                    "_id": "project5",
                    "visibility": "PUBLIC"
                  }
                }
              }
            },
            {
              "node": {
                "related": {
                  "_id": "eventComment2",
                  "commentable": {}
                }
              }
            },
            {
              "node": {
                "related": {
                  "_id": "proposalComment2",
                  "commentable": {
                    "project": {
                      "_id": "project6",
                      "visibility": "PUBLIC"
                    }
                  }
                }
              }
            },
            {
              "node": {
                "related": {
                  "id": "version17",
                  "nullable": {
                    "_id": "ProjectAccessibleForAdminOnly",
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
