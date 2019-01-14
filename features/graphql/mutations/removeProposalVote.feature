@proposals_votes
Feature: mutation removeProposalVote

@security
Scenario: Logged in API client wants to remove a vote but has not voted
  Given I am logged in to graphql as user
  And I send a GraphQL POST request:
  """
  {
    "query": "mutation ($input: RemoveProposalVoteInput!) {
      removeProposalVote(input: $input) {
        proposal {
          id
        }
      }
    }",
    "variables": {
      "input": {
        "stepId": "selectionstep1",
        "proposalId": "proposal2"
      }
    }
  }
  """
  Then the JSON response should match:
  """
  {
    "errors": [
      {
        "message": "You have not voted for this proposal in this step.",
        "category": @string@,
        "locations": [{"line":1,"column":50}],
        "path": ["removeProposalVote"]
      }
    ],
    "data": {
      "removeProposalVote": null
    }
  }
  """

@security
Scenario: Logged in API client wants to remove a vote but has not voted
  Given I am logged in to graphql as admin
  And I send a GraphQL POST request:
  """
  {
    "query": "mutation ($input: RemoveProposalVoteInput!) {
      removeProposalVote(input: $input) {
        proposal {
          id
        }
      }
    }",
    "variables": {
      "input": {
        "stepId": "selectionstep3",
        "proposalId": "proposal11"
      }
    }
  }
  """
  Then the JSON response should match:
  """
  {
    "errors": [
      {
        "message": "This step is no longer contributable.",
        "category": @string@,
        "locations": [{"line":1,"column":50}],
        "path": ["removeProposalVote"]
      }
    ],
    "data": {
      "removeProposalVote": null
    }
  }
  """

@database
Scenario: Logged in API client wants to remove a vote
  Given I am logged in to graphql as admin
  And I send a GraphQL POST request:
  """
  {
    "query": "mutation ($input: RemoveProposalVoteInput!) {
      removeProposalVote(input: $input) {
        proposal {
          id
        }
      }
    }",
    "variables": {
      "input": {
        "stepId": "selectionstep4",
        "proposalId": "proposal7"
      }
    }
  }
  """
  Then the JSON response should match:
  """
  {
    "data": {
      "removeProposalVote": {
        "proposal": {
          "id": "proposal7"
        }
      }
    }
  }
  """
