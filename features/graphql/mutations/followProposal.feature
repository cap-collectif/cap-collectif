@proposal_follow @proposal_follow_graphql
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
          followerConfiguration{
            notifiedOf
          }
        }
      }
    }",
    "variables": {
      "input": {
        "proposalId": "proposal8",
        "notifiedOf": "DEFAULT"
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
    "query": "query getFollowingProposal {
      viewer {
        followingProposals {
          id
        }
      }
    }"
  }
  """
  Then the JSON response should match:
  """
  {
    "data": {
      "viewer": {
        "followingProposals": [
          {
            "id": "proposal1"
          },
          {
            "id": "proposal2"
          },
          {
            "id": "proposal8"
          }
        ]
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
        "notifiedOf": "DEFAULT"
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
    "query": "query getFollowingProposal {
      viewer {
        followingProposals {
          id
        }
      }
    }"
  }
  """
  Then the JSON response should match:
  """
  {
    "data": {
      "viewer": {
        "followingProposals": [
          {
            "id": "proposal1"
          },
          {
            "id": "proposal2"
          },
          {
            "id": "proposal8"
          }
        ]
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
    "query": "query getFollowingProposal {
      viewer {
        followingProposals {
          id
        }
      }
    }"
  }
  """
  Then the JSON response should match:
  """
  {
    "data": {
      "viewer": {
        "followingProposals": [
          {
            "id": "proposal1"
          },
          {
            "id": "proposal2"
          }
        ]
      }
    }
  }
  """
