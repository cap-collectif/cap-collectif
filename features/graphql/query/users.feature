@users
Feature: check the users query

Scenario: GraphQL admin wants to get count of all users and have figures of email confirmations.
  Given I am logged in to graphql as "admin@test.com" with password "admin"
  And I send a GraphQL POST request:
  """
    {
      "query": "query getAllUsers {
        users {
		      totalCount
        }
        usersNotConfirmed: users(emailConfirmed: false) {
		      totalCount
        }
        usersConfirmed: users(emailConfirmed: true) {
		      totalCount
	      }
	      usersWithDisabled: users(withDisabled: true) {
	        totalCount
	      }
	      usersWithSuperAdmin: users(superAdmin: true) {
	        totalCount
	      }
      }"
    }
  """
  Then the JSON response should match:
  """
    {
      "data": {
        "users": {
          "totalCount": 226
        },
        "usersNotConfirmed": {
          "totalCount": 2
        },
        "usersConfirmed": {
          "totalCount": 224
        },
        "usersWithDisabled": {
          "totalCount": 228
        },
        "usersWithSuperAdmin": {
          "totalCount": 235
        }
      }
    }
  """
