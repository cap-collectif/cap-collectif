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
        previousVoteId
      }
    }",
    "variables": {
      "input": {
        "stepId": "U2VsZWN0aW9uU3RlcDpzZWxlY3Rpb25zdGVwMQ==",
        "proposalId": "UHJvcG9zYWw6cHJvcG9zYWwy"
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
        previousVoteId
      }
    }",
    "variables": {
      "input": {
        "stepId": "U2VsZWN0aW9uU3RlcDpzZWxlY3Rpb25zdGVwMw==",
        "proposalId": "UHJvcG9zYWw6cHJvcG9zYWwxMQ=="
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
        previousVoteId
      }
    }",
    "variables": {
      "input": {
        "stepId": "U2VsZWN0aW9uU3RlcDpzZWxlY3Rpb25zdGVwNA==",
        "proposalId": "UHJvcG9zYWw6cHJvcG9zYWw3"
      }
    }
  }
  """
  Then the JSON response should match:
  """
  {
    "data": {
      "removeProposalVote": {
        "previousVoteId": "1051"
      }
    }
  }
  """
