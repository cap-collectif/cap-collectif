@proposal @delete_proposal
Feature: Delete proposal

@database @rabbitmq
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
          "id": "proposal12",
          "deletedAt": "@string@.isDateTime()"
        }
      }
    }
  }
  """
  Then the queue associated to "proposal_delete" producer has messages below:
  | 0 | {"proposalId": "proposal12"} |

@database
Scenario: GraphQL client wants delete a proposal
  Given I am logged in to graphql as super admin
  And I send a GraphQL POST request:
  """
  {
    "query": "mutation ($input: DeleteProposalInput!) {
      deleteProposal(input: $input) {
        proposal {
          publicationStatus
        }
      }
    }",
    "variables": {
      "input": {
        "proposalId": "proposal8"
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
            "publicationStatus": "DELETED"
          }
        }
      }
  }
  """
