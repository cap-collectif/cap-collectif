@followProposal
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
        "proposalId": "proposal8",
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
          "id": "proposal8",
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
        "proposalId": "proposal8",
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
          "id": "proposal8"
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
                "id": "proposal1"
              }
            },
            {
              "cursor": @string@,
              "node": {
                "id": "proposal2"
              }
            },
            {
              "cursor": @string@,
              "node": {
                "id": "proposal8"
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
        "proposalId": "proposal8"
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
          "id": "proposal8"
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
