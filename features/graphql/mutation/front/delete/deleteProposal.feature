@deleteProposal @delete
Feature: Delete proposal

@database @rabbitmq
Scenario: The rabbitmq message contains id of supervisor and decisionMaker on delete
  Given feature "unstable__analysis" is enabled
  And I am logged in to graphql as super admin
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
        "proposalId": "UHJvcG9zYWw6cHJvcG9zYWwxMTA="
      }
    }
  }
  """
  Then the queue associated to "proposal_delete" producer has messages below:
    | 0 | {"proposalId": "proposal110", "supervisorId": "userSupervisor", "decisionMakerId": "userDecisionMaker"} |

# If you need to add a test here add it to deleteProposal.js instead of here
