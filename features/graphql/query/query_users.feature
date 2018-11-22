@query_users
Feature: Get all users

@read-only
Scenario: GraphQL admin want to get users including superadmin
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
