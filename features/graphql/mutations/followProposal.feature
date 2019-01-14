@followProposal @proposal_follow_graphql
Feature: Follow Proposals

@database
Scenario: GraphQL client wants to follow a proposal with current user and check if proposal if followed
  Given I am logged in to graphql as admin
  And I send a GraphQL POST request:
  """
  {
    "query": "mutation ($input: FollowProposalInput!) {
      followProposal(input: $input) {
        proposal {
          id
          viewerFollowingConfiguration
        }
      }
    }",
    "variables": {
      "input": {
        "proposalId": "UHJvcG9zYWw6cHJvcG9zYWw4",
        "notifiedOf": "MINIMAL"
      }
    }
  }
  """
  Then the JSON response should match:
  """
  {
    "data": {
      "followProposal": {
        "proposal": {
          "id": "UHJvcG9zYWw6cHJvcG9zYWw4",
          "viewerFollowingConfiguration": "MINIMAL"
        }
      }
    }
  }
  """
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
Scenario: GraphQL client wants to follow then unfollow a proposal with current user
  Given I am logged in to graphql as admin
  And I send a GraphQL POST request:
  """
  {
    "query": "mutation ($input: FollowProposalInput!) {
      followProposal(input: $input) {
        proposal {
          id
        }
      }
    }",
    "variables": {
      "input": {
        "proposalId": "UHJvcG9zYWw6cHJvcG9zYWw4",
        "notifiedOf": "MINIMAL"
      }
    }
  }
  """
  Then the JSON response should match:
  """
  {
    "data": {
      "followProposal": {
        "proposal": {
          "id": "UHJvcG9zYWw6cHJvcG9zYWw4"
        }
      }
    }
  }
  """
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
                "id": "UHJvcG9zYWw6cHJvcG9zYWwx"
              }
            },
            {
              "cursor": @string@,
              "node": {
                "id": "UHJvcG9zYWw6cHJvcG9zYWwy"
              }
            },
            {
              "cursor": @string@,
              "node": {
                "id": "UHJvcG9zYWw6cHJvcG9zYWw4"
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
    "query": "mutation ($input: UnfollowProposalInput!) {
      unfollowProposal(input: $input) {
        proposal {
          id
        }
      }
    }",
    "variables": {
      "input": {
        "proposalId": "UHJvcG9zYWw6cHJvcG9zYWw4"
      }
    }
  }
  """
  Then the JSON response should match:
  """
  {
    "data": {
      "unfollowProposal": {
        "proposal": {
          "id": "UHJvcG9zYWw6cHJvcG9zYWw4"
        }
      }
    }
  }
  """
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
                "id": "UHJvcG9zYWw6cHJvcG9zYWwx"
              }
            },
            {
              "cursor": @string@,
              "node": {
                "id": "UHJvcG9zYWw6cHJvcG9zYWwy"
              }
            }
          ]
        }
      }
    }
  }
  """
