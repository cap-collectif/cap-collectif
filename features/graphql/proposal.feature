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
          "id": 1
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
      And I am logged in to graphql as admin
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
            "theme": "1",
            "author": "userAdmin",
            "district": "2",
            "category": "2",
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
            "address": "[{\"address_components\":[{\"long_name\":\"18\",\"short_name\":\"18\",\"types\":[\"street_number\"]},{\"long_name\":\"Avenue Parmentier\",\"short_name\":\"Avenue Parmentier\",\"types\":[\"route\"]},{\"long_name\":\"Paris\",\"short_name\":\"Paris\",\"types\":[\"locality\",\"political\"]},{\"long_name\":\"Paris\",\"short_name\":\"Paris\",\"types\":[\"administrative_area_level_2\",\"political\"]},{\"long_name\":\"\u00CEle-de-France\",\"short_name\":\"\u00CEle-de-France\",\"types\":[\"administrative_area_level_1\",\"political\"]},{\"long_name\":\"France\",\"short_name\":\"FR\",\"types\":[\"country\",\"political\"]},{\"long_name\":\"75011\",\"short_name\":\"75011\",\"types\":[\"postal_code\"]}],\"formatted_address\":\"18 Avenue Parmentier, 75011 Paris, France\",\"geometry\":{\"location\":{\"lat\":48.8599104,\"lng\":2.3791948},\"location_type\":\"ROOFTOP\",\"viewport\":{\"northeast\":{\"lat\":48.8612593802915,\"lng\":2.380543780291502},\"southwest\":{\"lat\":48.8585614197085,\"lng\":2.377845819708498}}},\"place_id\":\"ChIJC5NyT_dt5kcRq3u4vOAhdQs\",\"types\":[\"street_address\"]}]",
            "id": 2
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
              "theme": { "id": "1" },
              "district": { "id": "2" },
              "category": { "id": "2" },
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
              "proposalId": "2",
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
        Scenario: GraphQL client wants select a proposal, then unselect
          Given I am logged in to graphql as admin
          And I send a GraphQL POST request:
          """
          {
          "query": "mutation ($input: SelectProposalInput!) {
            selectProposal(input: $input) {
              proposal {
                id
              }
            }
          }",
          "variables": {
            "input": {
              "stepId": "selectionstep1",
              "proposalId": "8",
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
                  "id": "8"
                }
              }
            }
          }
          """
          And proposal "8" should be selected in selection step "selectionstep1"
          When I send a GraphQL POST request:
          """
          {
            "query": "mutation ($input: UnselectProposalInput!) {
              unselectProposal(input: $input) {
                proposal {
                  id
                }
              }
            }",
            "variables": {
              "input": {
                "stepId": "selectionstep1",
                "proposalId": "8"
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
                  "id": "8"
                }
              }
            }
          }
          """
          And proposal "8" should not be selected in selection step "selectionstep1"

        @database
        Scenario: GraphQL client wants to update proposal status
          Given I am logged in to graphql as admin
          And I send a GraphQL POST request:
          """
          {
            "query": "mutation ($input: ChangeSelectionStatusInput!) {
              changeSelectionStatus(input: $input) {
                proposal {
                  id
                }
              }
            }",
            "variables": {
              "input": {
                "stepId": "selectionstep1",
                "proposalId": "3",
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
                  "id": "3"
                }
              }
            }
          }
          """
          And selection "selectionstep1" 3 should have status 1
          And 1 mail should be sent
          And I open mail with subject "Le statut de votre proposition vient d’être mis à jour sur Cap-Collectif."
          Then I should see "<li><strong>Nouveau statut :</strong> En cours</li>" in mail
          When I send a GraphQL POST request:
          """
          {
            "query": "mutation ($input: ChangeSelectionStatusInput!) {
              changeSelectionStatus(input: $input) {
                proposal {
                  id
                }
              }
            }",
            "variables": {
              "input": {
                "stepId": "selectionstep1",
                "proposalId": "3",
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
                  "id": "3"
                }
              }
            }
          }
          """
          And selection "selectionstep1" 3 should have no status

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
                "proposalId": "8"
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
                  "proposalId": "8",
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
