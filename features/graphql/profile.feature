@profile
Feature: Profile

Scenario: GraphQL client wants to get a user's notifications configuration
  Given I am logged in to graphql as user
  When I send a GraphQL request:
  """
  {
    viewer {
      notificationsConfiguration {
        onProposalCommentMail
      }
    }
  }
  """
  Then the JSON response should match:
  """
  {
    "data": {
      "viewer": {
        "notificationsConfiguration": {
          "onProposalCommentMail": @boolean@
        }
      }
    }
  }
  """

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
