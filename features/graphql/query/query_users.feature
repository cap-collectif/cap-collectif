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
                "_id": "adminCapco"
              }
            },
            {
              "node": {
                "_id": "user_drupal"
              }
            },
            {
              "node": {
                "_id": "user1"
              }
            },
            {
              "node": {
                "_id": "user10"
              }
            },
            {
              "node": {
                "_id": "user100"
              }
            }
          ]
        }
      }
    }
    """

@read-only
Scenario: GraphQL admin want to get users except superadmin
  Given I am logged in to graphql as admin
  And I send a GraphQL POST request:
  """
  {
    "query": "{
      users(first: 5) {
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
              "_id": "adminCapco"
            }
          },
          {
            "node": {
              "_id": "user_drupal"
            }
          },
          {
            "node": {
              "_id": "user10"
            }
          },
          {
            "node": {
              "_id": "user100"
            }
          },
          {
            "node": {
              "_id": "user101"
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
