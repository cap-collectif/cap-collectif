@followOpinion
Feature: Follow Opinions

@database
Scenario: GraphQL client wants to follow an opinion with current user and check if opinion if followed
  Given I am logged in to graphql as admin
  And I send a GraphQL POST request:
  """
  {
    "query": "mutation ($input: FollowOpinionInput!) {
      followOpinion(input: $input) {
        opinion {
          id
          followerConfiguration{
            notifiedOf
          }
        }
      }
    }",
    "variables": {
      "input": {
        "opinionId": "opinion7",
        "notifiedOf": "DEFAULT"
      }
    }
  }
  """
  Then the JSON response should match:
  """
  {
    "data": {
      "followOpinion": {
        "opinion": {
          "id": "opinion7",
          "followerConfiguration":{
            "notifiedOf":"DEFAULT"
          }
        }
      }
    }
  }
  """
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
        "followingOpinions": {
          "edges": [
            {
              "cursor": @string@,
              "node": {
                "id": @string@
              }
            },
            @...@
          ]
        }
      }
    }
  }
  """

@database
Scenario: GraphQL client wants to follow then unfollow an opinion with current user
  Given I am logged in to graphql as user
  And I send a GraphQL POST request:
  """
  {
    "query": "mutation ($input: FollowOpinionInput!) {
      followOpinion(input: $input) {
        opinion {
          id
        }
      }
    }",
    "variables": {
      "input": {
        "opinionId": "opinion10",
        "notifiedOf": "DEFAULT"
      }
    }
  }
  """
  Then the JSON response should match:
  """
  {
    "data": {
      "followOpinion": {
        "opinion": {
          "id": "opinion10"
        }
      }
    }
  }
  """
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
        "followingOpinions": {
          "edges": [
            {
              "cursor": @string@,
              "node": {
                "id": "opinion10"
              }
            }
          ]
        }
      }
    }
  }
  """
  And I send a GraphQL POST request:
  """
  {
    "query": "mutation ($input: UnfollowOpinionInput!) {
      unfollowOpinion(input: $input) {
        proposal {
          id
        }
      }
    }",
    "variables": {
      "input": {
        "opinionId": "opinion10"
      }
    }
  }
  """
  Then the JSON response should match:
  """
  {
    "data": {
      "unfollowOpinion": {
        "opinion": {
          "id": "opinion10"
        }
      }
    }
  }
  """
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
          "edges": []
        }
      }
    }
  }
  """
