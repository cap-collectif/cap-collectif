@proposal
Feature: Proposals

  @database
  Scenario: GraphQL client wants to change proposal status
    Given I send a GraphQL POST request:
    """
    {
      "query": "mutation ($input: ChangeProposalPublicationStatusInput!) {
        changeProposalPublicationStatus(input: $input) {
          proposal {
            publicationStatus
          }
        }
      }",
      "variables": {
        "input": {
          "publicationStatus": "TRASHED",
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
            "publicationStatus":"TRASHED"
          }
        }
      }
    }
    """

    Scenario: GraphQL client wants to change proposal content
      Given I send a GraphQL POST request:
      """
      {
        "query": "mutation ($input: ChangeProposalContentInput!) {
          changeProposalContent(input: $input) {
            proposal {
              title
              body
            }
          }
        }",
        "variables": {
          "input": {
            "title": "newTitle",
            "body": "newBody",
            "id": 1
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
              "title": "newTitle",
              "body": "newBody"
            }
          }
        }
      }
      """

      # @database
      # Scenario: Admin API client wants to notify that a proposal's status changed
      #   Given I am logged in to api as admin
      #   When I send a POST request to "/api/proposals/2/notify-status-changed"
      #   Then the JSON response status code should be 204
      #   And 1 mail should be sent
      #   And I open mail with subject "Le statut de votre proposition vient d’être mis à jour sur Cap-Collectif."
      #   Then I should see "<li><strong>Nouveau statut :</strong> Approuvé</li>" in mail
