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
