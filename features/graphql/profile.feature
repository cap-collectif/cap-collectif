@profile
Feature: Profile

Scenario: GraphQL client wants to get an user's notifications configuration
  Given I am logged in to graphql as user
  When I send a GraphQL request:
  """
  {
    userNotificationsConfiguration {
       onProposalCommentMail
     }
  }
  """
  Then the JSON response should match:
  """
  {
    "data": {
      "userNotificationsConfiguration": {
        "onProposalCommentMail": @boolean@
      }
    }
  }
  """

@database
Scenario: GraphQL client wants to modify an user notifications configuration
  Given I am logged in to graphql as user
  And I send a GraphQL POST request:
  """
  {
    "query": "mutation ($input: ChangeUserNotificationsConfigurationInput!) {
      changeUserNotificationsConfiguration(input: $input) {
        userNotificationsConfiguration {
          onProposalCommentMail
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
        "userNotificationsConfiguration": {
          "onProposalCommentMail": false
        }
      }
    }
  }
  """
