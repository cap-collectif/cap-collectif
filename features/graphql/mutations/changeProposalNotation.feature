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
        "proposalId": "proposal8",
        "estimation": 1000,
        "likers": ["VXNlcjp1c2VyMQ==", "VXNlcjp1c2VyMg==", "VXNlcjp1c2VyMw=="]
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
