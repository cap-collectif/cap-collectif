Feature: Proposal Restful Api
  As an API client

  Scenario: Anonymous API client wants to get one proposal from a ProposalForm
    When I send a GET request to "/api/proposal_forms/1/proposals/1"
    Then the JSON response should match:
"""
{
  "id": @integer@,
  "title": @string@,
  "body": @string@,
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
  "_links": {
    "show": @string@
  },
  "votes_count": @integer@,
  "comments_count": @integer@,
  "created_at": "@string@.isDateTime()",
  "updated_at": "@string@.isDateTime()"
}
"""

  Scenario: Anonymous API client wants to get all proposals from a ProposalForm
    When I send a GET request to "/api/proposal_forms/1/proposals?order=favorable&limit=1"
    Then the JSON response should match:
"""
[
  {
    "id": @integer@,
    "title": @string@,
    "body": @string@,
    "author": @...@,
    "_links": @...@,
    "votes_count": @integer@,
    "comments_count": @integer@,
    "created_at": "@string@.isDateTime()",
    "updated_at": "@string@.isDateTime()"
  }
]
"""

  Scenario: Anonymous API client wants to get all proposals from a ProposalForm
    When I send a GET request to "/api/proposal_forms/1/proposals?order=favorable&limit=1&theme=4"
    Then the JSON response should match:
"""
[]
"""


  @database @post
  Scenario: logged in API client wants to add a proposal
    Given I am logged in to api as user
    When I send a POST request to "/api/proposal_forms/1/proposals" with json:
"""
{
  "title": "Acheter un sauna pour Capco",
  "body": "Avec tout le travail accompli, on mérite bien un (petit) cadeau, donc on a choisi un sauna. Attention JoliCode ne sera accepté que sur invitation !",
  "theme": "1"
  "proposalResponses": [
    {
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

#  @database
#  Scenario: logged in API client wants to edit a proposal
#    Given I am logged in to api as user
#    When I send a DELETE request to "api/proposal_forms/1/proposals/1" with json:
#    Then the JSON response status code should be 200
