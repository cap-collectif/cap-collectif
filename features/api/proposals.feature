Feature: Proposal Restful Api
  As an API client
  @debug
  Scenario: Anonymous API client wants to get one proposal from a ProposalForm
    When I send a GET request to "/api/proposal_forms/1/proposals/1"
    Then the JSON response should match:
    """
    {
      "id": @integer@,
      "body": @string@,
      "updated_at": "@string@.isDateTime()",
      "theme": {
        "id": @integer@,
        "title": @string@,
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
      "author": {
        "username": "welcomattic",
        "displayName": "welcomattic",
        "uniqueId": "welcomattic",
        "isAdmin": true,
        "media": @...@,
        "user_type": {
          "id": @integer@,
          "name": @string@,
          "slug": @string@,
          "questionType": @number@,
          "title": @string@
        },
        "vip": true,
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
          "question": {
            "id": @integer@,
            "questionType": @number@,
            "title": @string@,
            "isRequired": @boolean@
          },
          "value": @string@
        },
        @...@
      ],
      "selectionSteps": [
        {
          "id": @integer@
        }
      ],
      "comments_count": @integer@,
      "created_at": "@string@.isDateTime()",
      "enabled": @boolean@,
      "isTrashed": @boolean@,
      "trashedReason": @...@,
      "title": @string@,
      "estimation": @number@,
      "answer": {
        "title": "Réponse du gouvernement à la proposition",
        "body": @string@,
        "author": @...@
      },
      "hasUserReported": @boolean@,
      "_links": {
        "show": @string@,
        "index": @string@,
        "report": @string@
      }
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
          "hasUserReported": @boolean@,
          "_links": @...@
        },
        @...@
      ],
      "count": 4
    }
    """

  @elasticsearch
  Scenario: Anonymous API client wants to get proposals from a ProposalForm with filters
    When I send a POST request to "/api/proposal_forms/1/proposals/search" with json:
    """
    {
      "terms": null,
      "filters": {
        "theme": 2,
        "type": 1,
        "status": 1,
        "district": 1
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
          "hasUserReported": @boolean@,
          "_links": @...@
        }
      ],
      "count": 1
    }
    """


  @database
  Scenario: logged in API client wants to add a proposal
    Given I am logged in to api as user
    When I send a POST request to "/api/proposal_forms/1/proposals" with json:
    """
    {
      "title": "Acheter un sauna pour Capco",
      "body": "Avec tout le travail accompli, on mérite bien un (petit) cadeau, donc on a choisi un sauna. Attention JoliCode ne sera accepté que sur invitation !",
      "theme": 1,
      "district": 1,
      "proposalResponses": [
        {
          "question": 1,
          "value": "Mega important"
        }
      ]
    }
    """
    Then the JSON response status code should be 201

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
