@proposals_votes
Feature: Proposal Votes GraphQL Api

@security
Scenario: Logged in API client wants to vote for a proposal in a step with vote limited but has already reached vote limit
  Given I am logged in to graphql as user
  And I send a GraphQL POST request:
  """
  {
    "query": "mutation ($input: AddProposalVoteInput!) {
      addProposalVote(input: $input) {
        proposal {
          id
        }
      }
    }",
    "variables": {
      "input": {
        "stepId": "selectionstep8",
        "proposalId": "proposal1"
      }
    }
  }
  """
  Then the JSON response should match:
  """
  {
    "data": {
      "addProposalVote": null
    }
  }
  """

@database
Scenario: Logged in API client wants to vote for a proposal
  Given I am logged in to graphql as user
  And I send a GraphQL POST request:
  """
  {
    "query": "mutation ($input: AddProposalVoteInput!) {
      addProposalVote(input: $input) {
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
    "data": {
      "addProposalVote": {
        "proposal": {
          "id": "proposal2"
        }
      }
    }
  }
  """

@security
Scenario: Logged in API client wants to vote several times for a proposal in a step
  Given I am logged in to graphql as admin
  And I send a GraphQL POST request:
  """
  {
    "query": "mutation ($input: AddProposalVoteInput!) {
      addProposalVote(input: $input) {
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
    "data": {
      "addProposalVote": null
    }
  }
  """

@security
Scenario: Logged in API client wants to vote for a proposal in a wrong selection step
  Given I am logged in to graphql as user
  And I send a GraphQL POST request:
  """
  {
    "query": "mutation ($input: AddProposalVoteInput!) {
      addProposalVote(input: $input) {
        proposal {
          id
        }
      }
    }",
    "variables": {
      "input": {
        "stepId": "selectionstep1",
        "proposalId": "proposal13"
      }
    }
  }
  """
  Then the JSON response should match:
  """
  {
    "data": {
      "addProposalVote": null
    }
  }
  """
  # "This proposal is not associated to this selection step."

@security
Scenario: Logged in API client wants to vote for a proposal in a not votable selection step
  Given I am logged in to graphql as user
  And I send a GraphQL POST request:
  """
  {
    "query": "mutation ($input: AddProposalVoteInput!) {
      addProposalVote(input: $input) {
        proposal {
          id
        }
      }
    }",
    "variables": {
      "input": {
        "stepId": "selectionstep2",
        "proposalId": "proposal2"
      }
    }
  }
  """
  Then the JSON response should match:
  """
  {
    "data": {
      "addProposalVote": null
    }
  }
  """
    # "message": "This selection step is not votable.",

@security
Scenario: Logged in API client wants to vote for a proposal in a not votable selection step
  Given I am logged in to graphql as user
  And I send a GraphQL POST request:
  """
  {
    "query": "mutation ($input: AddProposalVoteInput!) {
      addProposalVote(input: $input) {
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
    "data": {
      "addProposalVote": null
    }
  }
  """
    # "message": "This selection step is no longer contributable.",

@security
Scenario: Logged in API client wants to vote for a proposal in a not votable selection step
  Given I am logged in to graphql as user
  And I send a GraphQL POST request:
  """
  {
    "query": "mutation ($input: AddProposalVoteInput!) {
      addProposalVote(input: $input) {
        proposal {
          id
        }
      }
    }",
    "variables": {
      "input": {
        "stepId": "selectionstep4",
        "proposalId": "proposal8"
      }
    }
  }
  """
  Then the JSON response should match:
  """
  {
    "data": {
      "addProposalVote": null
    }
  }
  """
  # "errors": ["proposal.vote.not_enough_credits"],
