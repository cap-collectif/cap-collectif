@changeUserNotificationsConfiguration
Feature: changeUserNotificationsConfiguration

@database
Scenario: GraphQL client wants to modify a user notifications configuration
  Given I am logged in to graphql as user
  And I send a GraphQL POST request:
  """
  {
    "query": "mutation ($input: ChangeUserNotificationsConfigurationInput!) {
      changeUserNotificationsConfiguration(input: $input) {
        user {
          notificationsConfiguration {
            onProposalCommentMail
          }
        }
      }
    }",
    "variables": {
      "input": {
        "onProposalCommentMail": false
      }
    }
  }
  """
  Then the JSON response should match:
  """
  {
    "data": {
      "changeUserNotificationsConfiguration": {
        "user": {
          "notificationsConfiguration": {
            "onProposalCommentMail": false
          }
        }
      }
    }
  }
  """
