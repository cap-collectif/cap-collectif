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
                "id": "proposal2"
              }
            }
          ]
        }
      }
    }
  }
  """
