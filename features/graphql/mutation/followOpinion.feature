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
          ...on Opinion {
            id
            viewerFollowingConfiguration
          }
          ...on Version {
            id
            viewerFollowingConfiguration
          }
        }
      }
    }",
    "variables": {
      "input": {
        "opinionId": "opinion7",
        "notifiedOf": "MINIMAL"
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
          "viewerFollowingConfiguration": "MINIMAL"
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
          ...on Opinion {
            id
          }
          ...on Version {
            id
          }
        }
      }
    }",
    "variables": {
      "input": {
        "opinionId": "opinion10",
        "notifiedOf": "MINIMAL"
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
            },
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
  And I send a GraphQL POST request:
  """
  {
    "query": "mutation ($input: UnfollowOpinionInput!) {
      unfollowOpinion(input: $input) {
        opinion {
          ...on Opinion {
            id
          }
          ...on Version {
            id
          }
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
