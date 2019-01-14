@proposal_follow @proposal_follow_graphql
Feature: Update follow Proposals

@database
Scenario: GraphQL client wants to update follow a proposal with current user
  Given I am logged in to graphql as admin
  And I send a GraphQL POST request:
  """
  {
    "query": "mutation ($input: UpdateFollowProposalInput!) {
      updateFollowProposal(input: $input) {
        proposal {
          id
          viewerFollowingConfiguration
        }
      }
    }",
    "variables": {
      "input": {
        "proposalId": "UHJvcG9zYWw6cHJvcG9zYWwx",
        "notifiedOf": "MINIMAL"
      }
    }
  }
  """
  Then the JSON response should match:
  """
  {
    "data": {
      "updateFollowProposal": {
        "proposal": {
          "id": "UHJvcG9zYWw6cHJvcG9zYWwx",
          "viewerFollowingConfiguration": "MINIMAL"
        }
      }
    }
  }
  """
