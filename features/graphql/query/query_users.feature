@query_users
Feature: Get all users

@read-only
Scenario: GraphQL admin want to get users including superadmin
  Given I am logged in to graphql as admin
  And I send a GraphQL POST request:
    """
    {
      "query": "{
        users(first: 5, superAdmin: true) {
          totalCount
          edges {
            node {
              _id
            }
          }
        }
      }"
    }
    """
  Then the JSON response should match:
    """
    {
      "data": {
        "users": {
          "totalCount": @integer@,
          "edges": [
            {
              "node": {
                "_id": "user200"
              }
            },
            {
              "node": {
                "_id": "user199"
              }
            },
            {
              "node": {
                "_id": "user198"
              }
            },
            {
              "node": {
                "_id": "user197"
              }
            },
            {
              "node": {
                "_id": "user196"
              }
            }
          ]
        }
      }
    }
    """

@read-only
Scenario: Graphql anonymous want to search user author of event
  Given I send a GraphQL POST request:
  """
  {
      "query": "query UserListFieldQuery($displayName: String, $authorOfEventOnly: Boolean) {
          userSearch(displayName: $displayName, authorsOfEventOnly: $authorOfEventOnly) {
            id
            displayName
          }
      }",
    "variables": {"displayName":"xlac","authorOfEventOnly":true}
  }
  """
  Then the JSON response should match:
  """
  {"data":{"userSearch":[{"id":"VXNlcjp1c2VyMw==","displayName":"xlacot"}]}}
  """

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
    "data": {
      "user": {
        "proposals": {
          "edges": [
              {
              "node": {
                "project": {
                  "_id": "ProjectWithCustomAccess",
                  "visibility": "CUSTOM"
                }
              }
            },
            {
              "node": {
                "project": {
                  "_id": "ProjectWithCustomAccess",
                  "visibility": "CUSTOM"
                }
              }
            },
            {
              "node": {
                "project": {
                  "_id": "ProjectWithCustomAccess",
                  "visibility": "CUSTOM"
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
                  "_id": "project15",
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
Scenario: GraphQL anonymous want to get users's comment votes count
  Given I send a GraphQL POST request:
  """
  {
    "query": "{
      users(first: 5) {
        edges {
          node {
            _id
            commentVotes {
              totalCount
            }
          }
        }
      }
    }"
  }
  """
  Then the JSON response should match:
    """
    {
      "data": {
        "users": {
          "edges": [
            {
              "node": {
                "_id": "user200",
                "commentVotes": {
                  "totalCount": 0
                }
              }
            },
            {
              "node": {
                "_id": "user199",
                "commentVotes": {
                  "totalCount": 0
                }
              }
            },
            {
              "node": {
                "_id": "user198",
                "commentVotes": {
                  "totalCount": 0
                }
              }
            },
            {
              "node": {
                "_id": "user197",
                "commentVotes": {
                  "totalCount": 0
                }
              }
            },
            {
              "node": {
                "_id": "user196",
                "commentVotes": {
                  "totalCount": 0
                }
              }
            }
          ]
        }
      }
    }
    """
