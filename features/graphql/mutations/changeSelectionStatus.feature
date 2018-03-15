@proposal
Feature: Proposals

@database
Scenario: GraphQL client wants to update proposal status
  Given I am logged in to graphql as admin
  And I send a GraphQL POST request:
  """
  {
    "query": "mutation ($input: ChangeSelectionStatusInput!) {
      changeSelectionStatus(input: $input) {
        proposal {
          selections {
            step {
              id
            }
            status {
              id
            }
          }
        }
      }
    }",
    "variables": {
      "input": {
            "stepId": "selectionstep1",
            "proposalId": "proposal3",
            "statusId": "status1"
          }
        }
      }
  """
  Then the JSON response should match:
  """
  {
    "data": {
      "changeSelectionStatus": {
        "proposal": {
          "selections": [{
            "step": { "id": "selectionstep1" },
            "status": { "id": "status1" }
          }]
        }
      }
    }
  }
  """
  And 1 mail should be sent
  And I open mail with subject 'proposal_status_change_selection.notification.subject {"%sitename%":"Cap-Collectif"}'
  Then I should see 'proposal_status_change_selection.notification.body {"%sitename%":"Cap-Collectif","%project%":"Budget Participatif Rennes","%proposal%":"Installation de bancs sur la place de la mairie","%step%":"S\u00e9lection","%status%":"En cours","%proposal_link%":"http:\/\/capco.test\/projects\/budget-participatif-rennes\/collect\/collecte-des-propositions\/proposals\/installation-de-bancs-sur-la-place-de-la-mairie","%user%":"welcomattic"}' in mail
  When I send a GraphQL POST request:
  """
  {
    "query": "mutation ($input: ChangeSelectionStatusInput!) {
      changeSelectionStatus(input: $input) {
        proposal {
          selections {
            step {
              id
            }
            status {
              id
            }
          }
        }
      }
    }",
    "variables": {
      "input": {
        "stepId": "selectionstep1",
        "proposalId": "proposal3",
        "statusId": null
      }
    }
  }
  """
  Then the JSON response should match:
  """
  {
    "data": {
      "changeSelectionStatus": {
        "proposal": {
          "selections": [{
            "step": { "id": "selectionstep1" },
            "status": null
          }]
        }
      }
    }
  }
  """
