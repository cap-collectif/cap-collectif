@proposals
Feature: Proposal Restful Api
  As an API client

  @parallel-scenario
  Scenario: Anonymous API client wants to get one proposal from a ProposalForm
    When I send a GET request to "/api/proposal_forms/1/proposals/1"
    Then the JSON response should match:
    """
    {
      "proposal": {
        "id": @integer@,
        "body": @string@,
        "updated_at": "@string@.isDateTime()",
        "estimation": @...@,
        "theme": {
          "id": @integer@,
          "title": @string@,
          "enabled": @boolean@,
          "_links": {
            "show": @string@
          }
        },
        "district": {
          "id": @integer@,
          "name": @string@
        },
        "status": {
          "id": @integer@,
          "name": @string@,
          "color": @string@
        },
        "category": {
          "id": @integer@,
          "name": @string@
        },
        "author": {
          "username": @string@,
          "displayName": @string@,
          "uniqueId": @string@,
          "isAdmin": @boolean@,
          "media": @...@,
          "user_type": {
            "id": @integer@,
            "name": @string@,
            "slug": @string@
          },
          "vip": @boolean@,
          "_links": {
            "profile": @string@,
            "settings": @string@
          }
        },
        "proposalForm": {
          "id": @integer@
        },
        "comments": @array@,
        "responses":[
          {
            "id": @integer@,
            "field": {
              "id": @integer@,
              "question": @string@,
              "type": @string@,
              "helpText": @string@,
              "slug": @string@,
              "required": @boolean@
            },
            "value": @string@,
            "updated_at": "@string@.isDateTime()"
          },
          @...@
        ],
        "selectionSteps": [
          {
            "projectId": @integer@,
            "position": @integer@,
            "id": @integer@,
            "title": @string@,
            "enabled": @boolean@,
            "startAt": "@string@.isDateTime()",
            "endAt": "@string@.isDateTime()",
            "voteType": @integer@,
            "votesHelpText": @string@,
            "open": @boolean@,
            "budget": @...@,
            "body": @string@
          }
        ],
        "comments_count": @integer@,
        "created_at": "@string@.isDateTime()",
        "votesCount": @integer@,
        "enabled": @boolean@,
        "isTrashed": @boolean@,
        "trashedReason": @...@,
        "title": @string@,
        "answer": {
          "title": "Réponse du gouvernement à la proposition",
          "body": @string@,
          "author": @...@
        },
        "votesCountBySelectionSteps": @...@,
        "hasUserReported": @boolean@,
        "likers": @array@,
        "_links": {
          "show": @string@,
          "index": @string@,
          "report": @string@
        }
      },
      "userHasVote": false,
      "creditsLeft": @...@
    }
    """

  @elasticsearch
  Scenario: Anonymous API client wants to get all proposals from a ProposalForm
    When I send a POST request to "/api/proposal_forms/1/proposals/search?page=1&pagination=50&order=old" with json:
    """
    {}
    """
    Then the JSON response should match:
    """
    {
      "proposals": [
        {
          "id": @integer@,
          "body": @string@,
          "updated_at": "@string@.isDateTime()",
          "theme": {
            "id": @integer@,
            "title": @string@,
            "enabled": @boolean@,
            "_links": @...@
          },
          "district": {
            "id": @integer@,
            "name": @string@
          },
          "status": {
            "id": @integer@,
            "name": @string@,
            "color": @string@
          },
          "category": {
            "id": @integer@,
            "name": @string@
          },
          "author": @...@,
          "proposalForm": {
            "id": @integer@
          },
          "comments": @...@,
          "responses": @...@,
          "selectionSteps": @...@,
          "comments_count": @integer@,
          "created_at": "@string@.isDateTime()",
          "votesCount": @integer@,
          "enabled": @boolean@,
          "isTrashed": @boolean@,
          "title": @string@,
          "answer": @...@,
          "votesCountBySelectionSteps": @...@,
          "likers": @array@,
          "_links": @...@
        },
        @...@
      ],
      "count": 6,
      "order": "old"
    }
    """

  @elasticsearch
  Scenario: Anonymous API client wants to get proposals from a ProposalForm with filters
    When I send a POST request to "/api/proposal_forms/1/proposals/search" with json:
    """
    {
      "terms": null,
      "filters": {
        "themes": 2,
        "types": 1,
        "statuses": 1,
        "districts": 1
      }
    }
    """
    Then the JSON response should match:
    """
    {
      "proposals": [
        {
          "id": @integer@,
          "body": @string@,
          "updated_at": "@string@.isDateTime()",
          "theme": {
            "id": @integer@,
            "title": @string@,
            "enabled": @boolean@,
            "_links": @...@
          },
          "district": {
            "id": @integer@,
            "name": @string@
          },
          "status": {
            "id": @integer@,
            "name": @string@,
            "color": @string@
          },
          "category": {
            "id": @integer@,
            "name": @string@
          },
          "author": @...@,
          "proposalForm": {
            "id": @integer@
          },
          "comments": @...@,
          "responses": @...@,
          "selectionSteps": @...@,
          "comments_count": @integer@,
          "created_at": "@string@.isDateTime()",
          "enabled": @boolean@,
          "isTrashed": @boolean@,
          "title": @string@,
          "answer": @...@,
          "votesCountBySelectionSteps": @...@,
          "likers": @array@,
          "_links": @...@
        }
      ],
      "count": 1,
      "order": "random"
    }
    """

    # Create proposal

  @database
  Scenario: Logged in API client wants to add a proposal (with no value for not required response)
    Given I am logged in to api as user
    Given feature themes is enabled
    Given feature districts is enabled
    When I send a POST request to "/api/proposal_forms/1/proposals" with json:
    """
    {
      "title": "Acheter un sauna pour Capco",
      "body": "Avec tout le travail accompli, on mérite bien un (petit) cadeau, donc on a choisi un sauna. Attention JoliCode ne sera accepté que sur invitation !",
      "district": 1,
      "theme": 1,
      "category": 1,
      "responses": [
        {
          "question": 1,
          "value": ""
        },
        {
          "question": 3,
          "value": "Réponse à la question obligatoire"
        }
      ]
    }
    """
    Then the JSON response status code should be 201

  @database
  Scenario: Logged in API client wants to add a proposal (with nothing for not required response)
    Given I am logged in to api as user
    Given feature themes is enabled
    Given feature districts is enabled
    When I send a POST request to "/api/proposal_forms/1/proposals" with json:
    """
    {
      "title": "Acheter un sauna pour Capco",
      "body": "Avec tout le travail accompli, on mérite bien un (petit) cadeau, donc on a choisi un sauna. Attention JoliCode ne sera accepté que sur invitation !",
      "district": 1,
      "theme": 1,
      "category": 1,
      "responses": [
        {
          "question": 3,
          "value": "Réponse à la question obligatoire"
        }
      ]
    }
    """
    Then the JSON response status code should be 201

  @security
  Scenario: Logged in API client wants to add a proposal without required response
    Given I am logged in to api as user
    Given feature themes is enabled
    Given feature districts is enabled
    When I send a POST request to "/api/proposal_forms/1/proposals" with json:
    """
    {
      "title": "Acheter un sauna pour Capco",
      "body": "Avec tout le travail accompli, on mérite bien un (petit) cadeau, donc on a choisi un sauna. Attention JoliCode ne sera accepté que sur invitation !",
      "district": 1,
      "theme": 1,
      "category": 1,
      "responses": [
        {
          "question": 1,
          "value": "Mega important"
        }
      ]
    }
    """
    Then the JSON response status code should be 400
    And the JSON response should match:
    """
    {
      "code": 400,
      "message": "Validation Failed",
      "errors": {
        "errors": [
          "Veuillez répondre à toutes les questions obligatoires pour soumettre cette proposition."
        ],
        "children": @...@
      }
    }
    """

  @security
  Scenario: Logged in API client wants to add a proposal with empty required response
    Given I am logged in to api as user
    Given feature themes is enabled
    Given feature districts is enabled
    When I send a POST request to "/api/proposal_forms/1/proposals" with json:
    """
    {
      "title": "Acheter un sauna pour Capco",
      "body": "Avec tout le travail accompli, on mérite bien un (petit) cadeau, donc on a choisi un sauna. Attention JoliCode ne sera accepté que sur invitation !",
      "district": 1,
      "theme": 1,
      "category": 1,
      "responses": [
        {
          "question": 1,
          "value": "Mega important"
        },
        {
          "question": 3,
          "value": ""
        }
      ]
    }
    """
    Then the JSON response status code should be 400
    And the JSON response should match:
    """
    {
      "code": 400,
      "message": "Validation Failed",
      "errors": {
          "errors": [
            "Veuillez répondre à toutes les questions obligatoires pour soumettre cette proposition."
          ],
          "children": @...@
      }
    }
    """

  @security
  Scenario: Logged in API client wants to add a proposal with no category when mandatory
    Given I am logged in to api as user
    And features themes, districts are enabled
    When I send a POST request to "/api/proposal_forms/1/proposals" with json:
    """
    {
      "title": "Acheter un sauna pour Capco",
      "body": "Avec tout le travail accompli, on mérite bien un (petit) cadeau, donc on a choisi un sauna. Attention JoliCode ne sera accepté que sur invitation !",
      "district": 1,
      "theme": 1,
      "responses": [
        {
          "question": 1,
          "value": "Mega important"
        },
        {
          "question": 3,
          "value": "Réponse à la question obligatoire"
        }
      ]
    }
    """
    Then the JSON response status code should be 400
    And the JSON response should match:
    """
    {
      "code": 400,
      "message": "Validation Failed",
      "errors": {
          "errors": [
            "Vous devez spécifier une catégorie."
          ],
          "children": @...@
      }
    }
    """

  @database
  Scenario: logged in API client wants to edit a proposal
    Given I am logged in to api as user
    When I send a PUT request to "api/proposal_forms/1/proposals/2" with json:
    """
    {
      "title": "Acheter un sauna par personne pour Capco",
      "body": "Avec tout le travail accompli, on mérite bien chacun un (petit) cadeau, donc on a choisi un sauna. JoliCode interdit"
    }
    """
    Then the JSON response status code should be 200

  @database
  Scenario: logged in API client wants to remove a proposal
    Given I am logged in to api as user
    When I send a DELETE request to "api/proposal_forms/1/proposals/2"
    Then the JSON response status code should be 204
