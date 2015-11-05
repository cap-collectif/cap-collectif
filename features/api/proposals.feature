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
    "title": @string@,
    "_links": {
      "show": @string@
    }
  },
  "district": {
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
        "questionType": @number@,
        "title": @string@
      },
      "value": @string@
    }
  ],
  "comments_count": @integer@,
  "created_at": "@string@.isDateTime()",
  "votes": @array@,
  "votes_count": @integer@,
  "title": @string@,
  "answer": {
    "title": "Réponse du gouvernement à la proposition",
    "body": @string@,
    "author": @...@
  },
  "_links": {
    "show": @string@
  }
}
"""

  Scenario: Anonymous API client wants to get all proposals from a ProposalForm
    When I send a GET request to "/api/proposal_forms/1/proposals?order=favorable&limit=1"
    Then the JSON response should match:
"""
{
  "proposals": [
    {
      "id": @integer@,
      "title": @string@,
      "body": @string@,
      "theme": @...@,
      "district": @...@,
      "status": @...@,
      "author": @...@,
      "_links": @...@,
      "responses": [
        {
          "id": @integer@,
          "value": @string@
        }
      ],
      "votes": @array@,
      "votes_count": @integer@,
      "comments_count": @integer@,
      "created_at": "@string@.isDateTime()",
      "updated_at": "@string@.isDateTime()"
    }
  ]
}
"""

  Scenario: Anonymous API client wants to get all proposals from a ProposalForm
    When I send a GET request to "/api/proposal_forms/1/proposals?theme=4"
    Then the JSON response should match:
"""
{
  "proposals": []
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

#  @database
#  Scenario: logged in API client wants to edit a proposal
#    Given I am logged in to api as user
#    When I send a PUT request to "api/proposal_forms/1/proposals/1" with json:
#"""
#{
#  "title": "Acheter un sauna par personne pour Capco",
#  "body": "Avec tout le travail accompli, on mérite bien chacun un (petit) cadeau, donc on a choisi un sauna. JoliCode interdit"
#}
#"""
#    Then the JSON response status code should be 200

  @database
  Scenario: logged in API client wants to remove a proposal
    Given I am logged in to api as user
    When I send a DELETE request to "api/proposal_forms/1/proposals/2"
    Then the JSON response status code should be 204
