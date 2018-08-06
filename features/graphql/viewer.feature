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

Scenario: GraphQL client wants to get list of opinions followed by the current user
  Given I am logged in to graphql as user
  And I send a GraphQL POST request:
  """
  {
    "query": "query getFollowingOpinion($count: Int, $cursor: String) {
      viewer {
        followingOpinions(first: $count, after: $cursor) {
          edges {
            cursor
            node {
              id
            }
          }
        }
      }
    }",
    "variables": {
      "count": 5,
      "cursor": null
    }
  }
  """
  Then the JSON response should match:
  """
  {
    "data": {
      "viewer": {
        "followingOpinions": {
          "edges": [
            {
              "cursor": @string@,
              "node": {
                "id": "opinion6"
              }
            },
            {
              "cursor": @string@,
              "node": {
                "id": "opinion7"
              }
            }
          ]
        }
      }
    }
  }
  """

Scenario: GraphQL client wants to get list of proposals followed by the current user
  Given I am logged in to graphql as admin
  And I send a GraphQL POST request:
  """
  {
    "query": "query getFollowingProposal($count: Int, $cursor: String) {
      viewer {
        followingProposals(first: $count, after: $cursor) {
          edges {
            cursor
            node {
              id
            }
          }
        }
      }
    }",
    "variables": {
      "count": 32,
      "cursor": null
    }
  }
  """
  Then the JSON response should match:
  """
  {
    "data": {
      "viewer": {
        "followingProposals": {
          "edges": [
            {
              "cursor": @string@,
              "node": {
                "id": "proposal1"
              }
            },
            {
              "cursor": @string@,
              "node": {
                "id": "proposal2"
              }
            }
          ]
        }
      }
    }
  }
  """
