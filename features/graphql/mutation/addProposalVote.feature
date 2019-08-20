@proposals_votes
Feature: mutation addProposalVote

@security
Scenario: Logged in API client wants to vote for a proposal in a step with vote limited but has already reached vote limit
  Given I am logged in to graphql as user
  And I send a GraphQL POST request:
  """
  {
    "query": "mutation ($input: AddProposalVoteInput!) {
      addProposalVote(input: $input) {
        vote {
          id
        }
      }
    }",
    "variables": {
      "input": {
        "stepId": "U2VsZWN0aW9uU3RlcDpzZWxlY3Rpb25zdGVwOA==",
        "proposalId": "UHJvcG9zYWw6cHJvcG9zYWwxNw=="
      }
    }
  }
  """
  Then the JSON response should match:
  """
  {
    "errors": [
      {
        "message": "You have reached the limit of votes.",
        "@*@": "@*@"
      }
    ],
    "data": {
      "addProposalVote": null
    }
  }
  """

@security
Scenario: Logged in API client without all requirements wants to vote for a proposal in a step with requirements
  Given I am logged in to graphql as admin
  And I send a GraphQL POST request:
  """
  {
    "query": "mutation ($input: AddProposalVoteInput!) {
      addProposalVote(input: $input) {
        vote {
          id
        }
      }
    }",
    "variables": {
      "input": {
        "stepId": "Q29sbGVjdFN0ZXA6Y29sbGVjdHN0ZXBWb3RlQ2xhc3NlbWVudA==",
        "proposalId": "UHJvcG9zYWw6cHJvcG9zYWwyNA=="
      }
    }
  }
  """
  Then the JSON response should match:
  """
  {
    "errors": [
      {
        "message": "You dont meets all the requirements.",
        "@*@": "@*@"
      }
    ],
    "data": {
      "addProposalVote": null
    }
  }
  """

@database
Scenario: Logged in API client wants to vote for a question in a step with requirements
  Given I am logged in to graphql as user
  And I send a GraphQL POST request:
  """
  {
    "query": "mutation ($input: AddProposalVoteInput!) {
      addProposalVote(input: $input) {
        vote {
          id
        }
      }
    }",
    "variables": {
      "input": {
        "stepId": "U2VsZWN0aW9uU3RlcDpzZWxlY3Rpb25RdWVzdGlvblN0ZXBWb3RlQ2xhc3NlbWVudA==",
        "proposalId": "UHJvcG9zYWw6cXVlc3Rpb24x"
      }
    }
  }
  """
  Then the JSON response should match:
  """
  {
     "data":{
        "addProposalVote":{
           "vote":{
              "id":"@string@"
           }
        }
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
        vote {
          id
          published
          proposal {
            id
          }
          author {
            _id
          }
        }
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
    "data": {
      "addProposalVote": {
        "vote": {
          "id": @string@,
          "published": true,
          "proposal": {
            "id": "UHJvcG9zYWw6cHJvcG9zYWwy"
          },
          "author": {
            "_id": "user5"
          }
        }
      }
    }
  }
  """

@database
Scenario: Logged in API client wants to vote for a proposal anonymously
  Given I am logged in to graphql as user
  And I send a GraphQL POST request:
  """
  {
    "query": "mutation ($input: AddProposalVoteInput!) {
      addProposalVote(input: $input) {
        vote {
          id
          proposal {
            id
          }
          author {
            id
          }
        }
      }
    }",
    "variables": {
      "input": {
        "anonymously": true,
        "stepId": "U2VsZWN0aW9uU3RlcDpzZWxlY3Rpb25zdGVwMQ==",
        "proposalId": "UHJvcG9zYWw6cHJvcG9zYWwy"
      }
    }
  }
  """
  Then the JSON response should match:
  """
  {
    "data": {
      "addProposalVote": {
        "vote": {
          "id": @string@,
          "proposal": {
            "id": "UHJvcG9zYWw6cHJvcG9zYWwy"
          },
          "author": null
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
        vote {
          id
        }
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
        "message": "proposal.vote.already_voted",
        "@*@": "@*@"
      }
    ],
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
        vote {
          id
        }
      }
    }",
    "variables": {
      "input": {
        "stepId": "U2VsZWN0aW9uU3RlcDpzZWxlY3Rpb25zdGVwMQ==",
        "proposalId": "UHJvcG9zYWw6cHJvcG9zYWwxMw=="
      }
    }
  }
  """
  Then the JSON response should match:
  """
  {
    "errors": [
      {
        "message": "This proposal is not associated to this selection step.",
        "@*@": "@*@"
      }
    ],
    "data": {
      "addProposalVote": null
    }
  }
  """

@security
Scenario: Logged in API client wants to vote for a proposal in a not votable selection step
  Given I am logged in to graphql as user
  And I send a GraphQL POST request:
  """
  {
    "query": "mutation ($input: AddProposalVoteInput!) {
      addProposalVote(input: $input) {
        vote {
          id
        }
      }
    }",
    "variables": {
      "input": {
        "stepId": "U2VsZWN0aW9uU3RlcDpzZWxlY3Rpb25zdGVwMg==",
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
        "message": "This step is not votable.",
        "@*@": "@*@"
      }
    ],
    "data": {
      "addProposalVote": null
    }
  }
  """

@security
Scenario: Logged in API client wants to vote for a proposal in a not votable selection step
  Given I am logged in to graphql as user
  And I send a GraphQL POST request:
  """
  {
    "query": "mutation ($input: AddProposalVoteInput!) {
      addProposalVote(input: $input) {
        vote {
          id
        }
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
        "@*@": "@*@"
      }
    ],
    "data": {
      "addProposalVote": null
    }
  }
  """

@security
Scenario: Logged in API client wants to vote for a proposal in a not votable selection step
  Given I am logged in to graphql as admin
  And I send a GraphQL POST request:
  """
  {
    "query": "mutation ($input: AddProposalVoteInput!) {
      addProposalVote(input: $input) {
        vote {
          id
        }
      }
    }",
    "variables": {
      "input": {
        "stepId": "U2VsZWN0aW9uU3RlcDpzZWxlY3Rpb25zdGVwNA==",
        "proposalId": "UHJvcG9zYWw6cHJvcG9zYWw4"
      }
    }
  }
  """
  Then the JSON response should match:
  """
  {
    "errors": [
      {
        "message": "proposal.vote.not_enough_credits",
        "@*@": "@*@"
      }
    ],
    "data": {
      "addProposalVote": null
    }
  }
  """
