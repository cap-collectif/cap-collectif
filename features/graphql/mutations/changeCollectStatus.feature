@changeCollectStatus
Feature: changeCollectStatus

@database
Scenario: GraphQL client wants to change proposal collect status
  Given I am logged in to graphql as admin
  And I send a GraphQL POST request:
  """
    {
      "query": "mutation ($input: ChangeCollectStatusInput!) {
        changeCollectStatus(input: $input) {
          proposal {
            status {
              id
            }
          }
        }
      }",
      "variables": {
        "input": {
          "proposalId": "proposal2",
          "statusId": "status3"
        }
      }
    }
  """
  Then the JSON response should match:
  """
  {
    "data": {
      "changeCollectStatus": {
        "proposal": {
          "status": {
            "id": "status3"
          }
        }
      }
    }
  }
  """