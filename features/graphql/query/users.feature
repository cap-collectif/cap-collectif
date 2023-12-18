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
      usersOnlyProjectAdmin: users(onlyProjectAdmins: true) {
          totalCount
        }
        usersWithConsentInternalCommunication: users(consentInternalCommunication: true) {
          totalCount
        }
        usersWithoutConsentInternalCommunication: users(consentInternalCommunication: false) {
          totalCount
        }
    }"
  }
  """
  Then the JSON response should match:
  """
  {
     "data":{
        "users":{
           "totalCount":232
        },
        "usersNotConfirmed":{
           "totalCount":2
        },
        "usersConfirmed":{
           "totalCount":230
        },
        "usersWithDisabled":{
           "totalCount":234
        },
        "usersWithSuperAdmin":{
           "totalCount":241
        },
        "usersOnlyProjectAdmin":{
           "totalCount":2
        },
        "usersWithConsentInternalCommunication":{
           "totalCount":203
        },
        "usersWithoutConsentInternalCommunication":{
           "totalCount":29
        }
     }
  }
  """
