@proposal @delete_proposal
Feature: Delete proposal

@database
Scenario: Admin should be notified if GraphQL client delete a proposal in a notifiable collect step
  Given features themes, districts are enabled
  And I am logged in to graphql as user
  And I send a GraphQL POST request:
  """
  {
    "query": "mutation ($input: DeleteProposalInput!) {
      deleteProposal(input: $input) {
        proposal {
          id
          deletedAt
        }
      }
    }",
    "variables": {
      "input": {
        "proposalId": "proposal12"
      }
    }
  }
  """
  Then the JSON response should match:
  """
  {
    "data": {
      "deleteProposal": {
        "proposal": {
          "id": @string@,
          "deletedAt": "@string@.isDateTime()"
        }
      }
    }
  }
  """
  And I wait 3 seconds
  And I open mail with subject 'notification.email.proposal.delete.subject'
  Then I should see 'notification.email.proposal.delete.body' in mail
