@proposal_follow @proposal_follow_graphql
Feature: Unfollow Proposals

@database
Scenario: GraphQL client wants to unfollow a proposal with current user and check if proposal is unfollowed
  Given I am logged in to graphql as admin
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
        "proposalId": "proposal1"
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
          "id": "proposal1"
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
            "id": "proposal2"
          }
        ]
      }
    }
  }
  """
