@changeProposalNotation
Feature: changeProposalNotation

@database
Scenario: GraphQL client wants note a proposal
  Given I am logged in to graphql as admin
  And I send a GraphQL POST request:
  """
  {
    "query": "mutation ($input: ChangeProposalNotationInput!) {
      changeProposalNotation(input: $input) {
        proposal {
          estimation
          likers {
            id
          }
        }
      }
    }",
    "variables": {
      "input": {
        "proposalId": "UHJvcG9zYWw6cHJvcG9zYWw4",
        "estimation": 1000,
        "likers": ["user1", "user2", "user3"]
      }
    }
  }
  """
  Then the JSON response should match:
  """
  {
    "data": {
      "changeProposalNotation": {
        "proposal": {
          "estimation": 1000,
          "likers": [{ "id": "VXNlcjp1c2VyMQ==" }, { "id": "VXNlcjp1c2VyMg==" }, { "id": "VXNlcjp1c2VyMw==" }]
        }
      }
    }
  }
  """
