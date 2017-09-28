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
Scenario: GraphQL client wants to change proposal content
  Given feature themes is enabled
  And feature districts is enabled
  And I am logged in to graphql as super admin
  And I send a GraphQL POST request:
  """
  {
    "query": "mutation ($input: ChangeProposalContentInput!) {
      changeProposalContent(input: $input) {
        proposal {
          title
          body
          author {
            id
          }
          theme {
            id
          }
          district {
            id
          }
          category {
            id
          }
          address
          responses {
            question {
              id
            }
            ... on ValueResponse {
              value
            }
            ... on MediaResponse {
              medias {
                id
              }
            }
          }
        }
      }
    }",
    "variables": {
      "input": {
        "title": "NewTitle",
        "body": "NewBody",
        "theme": "theme1",
        "author": "userAdmin",
        "district": "district2",
        "category": "pCategory2",
        "responses": [
          {
            "question": 1,
            "value": "reponse-1"
          },
          {
            "question": 3,
            "value": "reponse-3"
          }
        ],
        "address": "[{\"address_components\":[{\"long_name\":\"262\",\"short_name\":\"262\",\"types\":[\"street_number\"]},{\"long_name\":\"Avenue Général Leclerc\",\"short_name\":\"Avenue Général Leclerc\",\"types\":[\"route\"]},{\"long_name\":\"Rennes\",\"short_name\":\"Rennes\",\"types\":[\"locality\",\"political\"]},{\"long_name\":\"Ille-et-Vilaine\",\"short_name\":\"Ille-et-Vilaine\",\"types\":[\"administrative_area_level_2\",\"political\"]},{\"long_name\":\"Bretagne\",\"short_name\":\"Bretagne\",\"types\":[\"administrative_area_level_1\",\"political\"]},{\"long_name\":\"France\",\"short_name\":\"FR\",\"types\":[\"country\",\"political\"]},{\"long_name\":\"35700\",\"short_name\":\"35700\",\"types\":[\"postal_code\"]}],\"formatted_address\":\"262 Avenue Général Leclerc, 35700 Rennes, France\",\"geometry\":{\"bounds\":{\"northeast\":{\"lat\":48.1140978,\"lng\":-1.6404985},\"southwest\":{\"lat\":48.1140852,\"lng\":-1.640499}},\"location\":{\"lat\":48.1140852,\"lng\":-1.6404985},\"location_type\":\"RANGE_INTERPOLATED\",\"viewport\":{\"northeast\":{\"lat\":48.1154404802915,\"lng\":-1.639149769708498},\"southwest\":{\"lat\":48.1127425197085,\"lng\":-1.641847730291502}}},\"place_id\":\"EjIyNjIgQXZlbnVlIEfDqW7DqXJhbCBMZWNsZXJjLCAzNTcwMCBSZW5uZXMsIEZyYW5jZQ\",\"types\":[\"street_address\"]}]",
        "id": "proposal2"
      }
    }
  }
  """
  Then the JSON response should match:
  """
  {
    "data": {
      "changeProposalContent": {
        "proposal": {
          "title": "NewTitle",
          "body": "NewBody",
          "author": { "id": "userAdmin" },
          "theme": { "id": "theme1" },
          "district": { "id": "district2" },
          "category": { "id": "pCategory2" },
          "address": @string@,
          "responses": [
            { "question": { "id": "1" }, "value": "reponse-1" },
            { "question": { "id": "3" }, "value": "reponse-3" }
          ]
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
          "statusId": "3"
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
            "id": "3"
          }
        }
      }
    }
  }
  """
  And 1 mail should be sent
  And I open mail with subject "Le statut de votre proposition vient d’être mis à jour sur Cap-Collectif."
  Then I should see "<li><strong>Nouveau statut :</strong> Rejeté</li>" in mail

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
      "statusId": "1"
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
              "status": { "id": "1" }
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
            "statusId": "1"
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
            "status": { "id": "1" }
          }]
        }
      }
    }
  }
  """
  And 1 mail should be sent
  And I open mail with subject "Le statut de votre proposition vient d’être mis à jour sur Cap-Collectif."
  Then I should see "<li><strong>Nouveau statut :</strong> En cours</li>" in mail
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
