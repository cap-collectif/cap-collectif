Feature: Proposal Restful Api
  As an API client

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
      "name": @string@,
      "color": @string@
    },
    "author": {
      "username": "welcomattic",
      "displayName": "welcomattic",
      "uniqueId": "welcomattic",
      "isAdmin": true,
      "media": @...@,
      "vip": true,
      "_links": {
        "profile": @string@,
        "settings": @string@
      }
    },
    "comments": @array@,
    "responses":[
      {
        "question": {
          "id": @integer@,
          "questionType": @number@,
          "title": @string@
        },
        "value": @string@
      },
      @...@
    ],
    "comments_count": @integer@,
    "created_at": "@string@.isDateTime()",
    "votes": @array@,
    "votes_count": @integer@,
    "title": @string@,
    "isTrashed": @boolean@,
    "enabled": @boolean@,
    "trashedReason": @...@,
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

  Scenario: Anonymous API client wants to get all proposals from a ProposalForm
    When I send a GET request to "/api/proposal_forms/1/proposals?order=favorable&offset=1"
    Then the JSON response should match:
  """
  {
    "proposals": [
      {
        "id": @integer@,
        "body": @string@,
        "updated_at": "@string@.isDateTime()",
        "theme": @...@,
        "district": @...@,
        "status": @...@,
        "author": @...@,
        "comments": @array@,
        "responses": @array@,
        "comments_count": @integer@,
        "created_at": "@string@.isDateTime()",
        "votes": @array@,
        "votes_count": @integer@,
        "title": @string@,
        "answer": @null@,
        "_links": @...@
      }
    ],
    "count": 4
  }
  """

  Scenario: Anonymous API client wants to get all proposals from a ProposalForm
    When I send a GET request to "/api/proposal_forms/1/proposals?theme=4"
    Then the JSON response should match:
  """
  {
    "proposals": [],
    "count": 0
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
    When I send a PUT request to "api/proposal_forms/1/proposals/3" with json:
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
    When I send a DELETE request to "api/proposal_forms/1/proposals/3"
    Then the JSON response status code should be 204
