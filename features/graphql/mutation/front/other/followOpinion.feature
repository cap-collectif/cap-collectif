@followOpinion @other
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
        "opinionId": "T3BpbmlvbjpvcGluaW9uNw==",
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
          "id": "T3BpbmlvbjpvcGluaW9uNw==",
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
        "opinionId": "T3BpbmlvbjpvcGluaW9uMTA=",
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
          "id": "T3BpbmlvbjpvcGluaW9uMTA="
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
                "id": "T3BpbmlvbjpvcGluaW9uMTA="
              }
            },
            {
              "cursor": @string@,
              "node": {
                "id": "T3BpbmlvbjpvcGluaW9uNg=="
              }
            },
            {
              "cursor": @string@,
              "node": {
                "id": "T3BpbmlvbjpvcGluaW9uNw=="
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
        "opinionId": "T3BpbmlvbjpvcGluaW9uMTA="
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
          "id": "T3BpbmlvbjpvcGluaW9uMTA="
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
                "id": "T3BpbmlvbjpvcGluaW9uNg=="
              }
            },
            {
              "cursor": @string@,
              "node": {
                "id": "T3BpbmlvbjpvcGluaW9uNw=="
              }
            }
          ]
        }
      }
    }
  }
  """
