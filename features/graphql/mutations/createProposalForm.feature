@createProposalForm
Feature: Create Proposal Form

@database
Scenario: GraphQL client wants to create a proposal form
  Given I am logged in to graphql as admin
  And I send a GraphQL POST request:
  """
  {
    "query": "mutation ($input: CreateProposalFormInput!) {
      createProposalForm(input: $input) {
        proposalForm {
          id
          title
        }
      }
    }",
    "variables": {
      "input": {
        "title": "Cliquer"
      }
    }
  }
  """
  Then the JSON response should match:
  """
  {
    "data": {
      "createProposalForm": {
        "proposalForm": {
          "id": @string@,
          "title": "Cliquer"
        }
      }
    }
  }
  """
