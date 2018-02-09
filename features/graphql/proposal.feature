@proposal
Feature: Proposals

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
        "proposalId": "proposal1"
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
  And 1 mail should be sent
  And I open mail with subject 'proposal_status_change_collect.notification.subject'
  Then I should see 'proposal_status_change_collect.notification.body {"%sitename%":"Cap-Collectif","%project%":"Budget Participatif Rennes","%proposal%":"R\u00e9novation du gymnase","%status%":"Rejet\u00e9","%proposal_link%":"http:\/\/capco.test\/projects\/budget-participatif-rennes\/collect\/collecte-des-propositions\/proposals\/renovation-du-gymnase","%user%":"user"}' in mail

@database
Scenario: GraphQL client wants select a proposal without status
  Given I am logged in to graphql as admin
  And I send a GraphQL POST request:
  """
    {
    "query": "mutation ($input: SelectProposalInput!) {
      selectProposal(input: $input) {
        proposal {
          id
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
        "proposalId": "proposal8",
        "statusId": null
      }
    }
  }
  """
  Then the JSON response should match:
  """
    {
      "data": {
        "selectProposal": {
          "proposal": {
            "id": "proposal8",
            "selections": [
              {
                "step": { "id": "selectionstep4" },
                "status": null
              },
              {
                "step": { "id": "selectionstep1" },
                "status": null
              }
            ]
          }
        }
      }
    }
  """

@database
Scenario: GraphQL client wants select a proposal with status, then unselect
  Given I am logged in to graphql as admin
  And I send a GraphQL POST request:
  """
  {
  "query": "mutation ($input: SelectProposalInput!) {
    selectProposal(input: $input) {
      proposal {
        id
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
      "proposalId": "proposal8",
      "statusId": "status1"
    }
  }
  }
  """
  Then the JSON response should match:
  """
  {
    "data": {
      "selectProposal": {
        "proposal": {
          "id": "proposal8",
          "selections": [
            {
              "step": { "id": "selectionstep4" },
              "status": null
            },
            {
              "step": { "id": "selectionstep1" },
              "status": { "id": "status1" }
            }
          ]
        }
      }
    }
  }
  """
  When I send a GraphQL POST request:
  """
  {
    "query": "mutation ($input: UnselectProposalInput!) {
      unselectProposal(input: $input) {
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
        "proposalId": "proposal8"
      }
    }
  }
  """
  Then the JSON response should match:
  """
  {
    "data": {
      "unselectProposal": {
        "proposal": {
          "selections": [
            {
              "step": { "id": "selectionstep4" },
              "status": null
            }
          ]
        }
      }
    }
  }
  """

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
  And I open mail with subject 'proposal_status_change_selection.notification.subject'
  Then I should see 'proposal_status_change_selection.notification.body {"%project%":"Budget Participatif Rennes","%proposal%":"Installation de bancs sur la place de la mairie","%step%":"S\u00e9lection","%status%":"En cours","%proposal_link%":"http:\/\/capco.test\/projects\/budget-participatif-rennes\/collect\/collecte-des-propositions\/proposals\/installation-de-bancs-sur-la-place-de-la-mairie","%user%":"welcomattic"}' in mail
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
          "likers": [{ "id": "user1" }, { "id": "user2" }, { "id": "user3" }]
        }
      }
    }
  }
  """

@database
Scenario: GraphQL client wants to get list of available districts for a particular location
  Given I am logged in to graphql as admin
  And I send a GraphQL POST request:
  """
  {
    "query": "query ($stepId: ID!) {
      draftProposalsForUserInStep(stepId: $stepId) {
        title
        show_url
      }
    }",
    "variables": {
      "stepId": "collectstep1"
    }
  }
  """
  Then the JSON response should match:
  """
  {
    "data": {
      "draftProposalsForUserInStep": [
        {
          "title": "Proposition brouillon 3",
          "show_url": "http:\/\/capco.test\/projects\/budget-participatif-rennes\/collect\/collecte-des-propositions\/proposals\/proposition-brouillon-3"
        }
      ]
    }
  }
  """
