@viewer
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
