@proposal @update_proposal_steps
Feature: Update Proposal Steps

@database @rabbitmq
Scenario: Admin should be able to create and delete a proposal step in admin
  Given I am logged in to graphql as admin
  And I send a GraphQL POST request:
  """
  {
    "query": "mutation ($input: ChangeProposalProgressStepsInput!) {
      changeProposalProgressSteps(input: $input) {
        proposal {
          id
          progressSteps {
            id
            title
            startAt
            endAt
          }
        }
      }
    }",
    "variables": {
      "input": {
        "proposalId": "proposal1",
        "progressSteps": [
          {
            "title": "test",
            "startAt": "2018-03-07 00:00:00",
            "endAt": "2018-03-16 00:00:00"
          }
        ]
      }
    }
  }
  """
  Then the JSON response should match:
  """
  {
    "data": {
      "changeProposalProgressSteps": {
        "proposal": {
          "id": "proposal1",
          "progressSteps": [
            {
              "id": @string@ ,
              "title": "test",
              "startAt": "2018-03-07 00:00:00",
              "endAt": "2018-03-16 00:00:00"
            }
          ]
        }
      }
    }
  }
  """
  And I send a GraphQL POST request:
  """
  {
    "query": "mutation ($input: ChangeProposalProgressStepsInput!) {
      changeProposalProgressSteps(input: $input) {
        proposal {
          id
          progressSteps {
            id
            title
            startAt
            endAt
          }
        }
      }
    }",
    "variables": {
      "input": {
        "proposalId": "proposal1",
        "progressSteps": []
      }
    }
  }
  """
  Then the JSON response should match:
  """
  {
    "data": {
      "changeProposalProgressSteps": {
        "proposal": {
          "id": "proposal1",
          "progressSteps": []
        }
      }
    }
  }
  """
