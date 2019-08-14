@changeProposalPublicationStatus
Feature: changeProposalPublicationStatus

@database
Scenario: GraphQL client wants to trash a proposal
  Given I am logged in to graphql as admin
  And I send a GraphQL POST request:
  """
  {
    "query": "mutation ($input: ChangeProposalPublicationStatusInput!) {
      changeProposalPublicationStatus(input: $input) {
        proposal {
          publicationStatus
          trashedReason
        }
      }
    }",
    "variables": {
      "input": {
        "publicationStatus": "TRASHED",
        "trashedReason": "POPO",
        "proposalId": "UHJvcG9zYWw6cHJvcG9zYWwx"
      }
    }
  }
  """
  Then the JSON response should match:
  """
  {
    "data": {
      "changeProposalPublicationStatus": {
        "proposal": {
          "publicationStatus": "TRASHED",
          "trashedReason": "POPO"
        }
      }
    }
  }
  """
