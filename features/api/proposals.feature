@proposals
Feature: Proposal Restful Api
  As an API client

  @parallel-scenario
  Scenario: Anonymous API client wants to get one proposal from a ProposalForm and should not see private fields
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
              "required": @boolean@,
              "private": @boolean@
            },
            "value": @string@,
            "updated_at": "@string@.isDateTime()"
          },
          {
            "id": @integer@,
            "field": {
              "id": @integer@,
              "question": @string@,
              "type": @string@,
              "helpText": @string@,
              "slug": @string@,
              "required": @boolean@,
              "private": @boolean@
            },
            "value": @string@,
            "updated_at": "@string@.isDateTime()"
          }
        ],
        "selections": [
          {
            "step": {
              "id": @integer@,
              "projectId": @integer@,
              "position": @integer@,
              "title": @string@,
              "enabled": @boolean@,
              "startAt": "@string@.isDateTime()",
              "endAt": "@string@.isDateTime()",
              "voteType": @integer@,
              "votesHelpText": @string@,
              "open": @boolean@,
              "budget": @...@,
              "body": @string@,
              "timeless": @boolean@
            },
            "status": {
              "id": @integer@,
              "color": @string@,
              "name": @string@
            },
            "proposal": @...@
          }
        ],
        "comments_count": @integer@,
        "created_at": "@string@.isDateTime()",
        "enabled": @boolean@,
        "isTrashed": @boolean@,
        "trashedReason": @...@,
        "title": @string@,
        "answer": {
          "title": "Réponse du gouvernement à la proposition",
          "body": @string@,
          "author": @...@
        },
        "votesCountByStepId": @...@,
        "hasUserReported": @boolean@,
        "likers": @array@,
        "_links": {
          "show": @string@,
          "index": @string@
        }
      }
    }
    """

  @parallel-scenario
  Scenario: Admin wants to get one proposal from a ProposalForm and should see private fields
    Given I am logged in to api as admin
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
              "required": @boolean@,
              "private": @boolean@
            },
            "value": @string@,
            "updated_at": "@string@.isDateTime()"
          },
          {
            "id": @integer@,
            "field": {
              "id": @integer@,
              "question": @string@,
              "type": @string@,
              "helpText": @string@,
              "slug": @string@,
              "required": @boolean@,
              "private": @boolean@
            },
            "value": @string@,
            "updated_at": "@string@.isDateTime()"
          },
          {
            "id": @integer@,
            "field": {
              "id": @integer@,
              "question": @string@,
              "type": @string@,
              "helpText": @string@,
              "slug": @string@,
              "required": @boolean@,
              "private": @boolean@
            },
            "value": @string@,
            "updated_at": "@string@.isDateTime()"
          }
        ],
        "selections": [
          {
            "step": {
              "id": @integer@,
              "projectId": @integer@,
              "position": @integer@,
              "title": @string@,
              "enabled": @boolean@,
              "startAt": "@string@.isDateTime()",
              "endAt": "@string@.isDateTime()",
              "voteType": @integer@,
              "votesHelpText": @string@,
              "open": @boolean@,
              "budget": @...@,
              "body": @string@,
              "timeless": @boolean@
            },
            "status": {
              "id": @integer@,
              "color": @string@,
              "name": @string@
            },
            "proposal": @...@
          }
        ],
        "comments_count": @integer@,
        "created_at": "@string@.isDateTime()",
        "enabled": @boolean@,
        "isTrashed": @boolean@,
        "trashedReason": @...@,
        "title": @string@,
        "answer": {
          "title": "Réponse du gouvernement à la proposition",
          "body": @string@,
          "author": @...@
        },
        "votesByStepId": {
          "6": [],
          "22": []
        },
        "votableStepId": 6,
        "votesCountByStepId": {
          "6": 0,
          "22": 0
        },
        "hasUserReported": @boolean@,
        "likers": @array@,
        "_links": {
          "show": @string@,
          "index": @string@
        }
      }
    }
    """

  @parallel-scenario
  Scenario: User wants to get his proposal from a ProposalForm and should see private fields
    Given I am logged in to api as user
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
              "required": @boolean@,
              "private": @boolean@
            },
            "value": @string@,
            "updated_at": "@string@.isDateTime()"
          },
          {
            "id": @integer@,
            "field": {
              "id": @integer@,
              "question": @string@,
              "type": @string@,
              "helpText": @string@,
              "slug": @string@,
              "required": @boolean@,
              "private": @boolean@
            },
            "value": @string@,
            "updated_at": "@string@.isDateTime()"
          },
          {
            "id": @integer@,
            "field": {
              "id": @integer@,
              "question": @string@,
              "type": @string@,
              "helpText": @string@,
              "slug": @string@,
              "required": @boolean@,
              "private": @boolean@
            },
            "value": @string@,
            "updated_at": "@string@.isDateTime()"
          }
        ],
        "selections": [
          {
            "step": {
              "id": @integer@,
              "projectId": @integer@,
              "position": @integer@,
              "title": @string@,
              "enabled": @boolean@,
              "startAt": "@string@.isDateTime()",
              "endAt": "@string@.isDateTime()",
              "voteType": @integer@,
              "votesHelpText": @string@,
              "open": @boolean@,
              "budget": @...@,
              "body": @string@,
              "timeless": @boolean@
            },
            "status": {
              "id": @integer@,
              "color": @string@,
              "name": @string@
            },
            "proposal": @...@
          }
        ],
        "comments_count": @integer@,
        "created_at": "@string@.isDateTime()",
        "enabled": @boolean@,
        "isTrashed": @boolean@,
        "trashedReason": @...@,
        "title": @string@,
        "answer": {
          "title": "Réponse du gouvernement à la proposition",
          "body": @string@,
          "author": @...@
        },
        "votesCountByStepId": @...@,
        "hasUserReported": @boolean@,
        "likers": @array@,
        "_links": {
          "show": @string@,
          "index": @string@
        }
      }
    }
    """

  @elasticsearch
  Scenario: Anonymous API client wants to get all proposals from a collect step
    When I send a POST request to "/api/collect_steps/22/proposals/search?page=1&pagination=50&order=old" with json:
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
          "selections": @...@,
          "comments_count": @integer@,
          "created_at": "@string@.isDateTime()",
          "enabled": @boolean@,
          "isTrashed": @boolean@,
          "title": @string@,
          "answer": @...@,
          "votesCountByStepId": @...@,
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
  Scenario: Logged in API client wants to get all proposals from a private collect step
    Given I am logged in to api as user
    When I send a POST request to "/api/collect_steps/25/proposals/search?page=1&pagination=50&order=old" with json:
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
          "theme": @...@,
          "district": @...@,
          "status": @...@,
          "author": {
            "username": "user",
            "displayName": "user",
            "uniqueId": "user",
            "isAdmin": false,
            "user_type": @...@,
            "vip": false
          },
          "proposalForm": {
            "id": @integer@
          },
          "comments": @...@,
          "responses": @...@,
          "selections": @...@,
          "comments_count": @integer@,
          "created_at": "@string@.isDateTime()",
          "enabled": @boolean@,
          "isTrashed": @boolean@,
          "title": @string@,
          "votesCountByStepId": @...@,
          "likers": @array@,
          "_links": @...@
        },
        @...@
      ],
      "count": 2,
      "order": "old"
    }
    """

  @elasticsearch
  Scenario: Anonymous API client wants to get all proposals from a private collect step
    When I send a POST request to "/api/collect_steps/25/proposals/search?page=1&pagination=50&order=old" with json:
    """
    {}
    """
    Then the JSON response should match:
    """
    {
      "proposals": [],
      "count": 0,
      "order": "old"
    }
    """

  @elasticsearch
  Scenario: Anonymous API client wants to get proposals from a collect step with filters
    When I send a POST request to "/api/collect_steps/22/proposals/search?order=last" with json:
    """
    {
      "terms": null,
      "filters": {
        "categories": 2
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
          "selections": @...@,
          "comments_count": @integer@,
          "created_at": "@string@.isDateTime()",
          "enabled": @boolean@,
          "isTrashed": @boolean@,
          "title": @string@,
          "votesCountByStepId": @...@,
          "likers": @array@,
          "_links": @...@
        },
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
          "answer": @...@,
          "comments": @...@,
          "responses": @...@,
          "selections": @...@,
          "comments_count": @integer@,
          "created_at": "@string@.isDateTime()",
          "enabled": @boolean@,
          "isTrashed": @boolean@,
          "title": @string@,
          "votesCountByStepId": @...@,
          "likers": @array@,
          "_links": @...@
        }
      ],
      "count": 2,
      "order": "last"
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
    Scenario: Logged in admin API client wants to add a proposal with fusion
      Given I am logged in to api as admin
      Given feature themes is enabled
      Given feature districts is enabled
      When I send a POST request to "/api/proposal_forms/1/proposals" with json:
      """
      {
        "author": 2,
        "childConnections": [1, 2],
        "title": "Acheter un sauna pour Capco",
        "body": "Avec tout le travail accompli, on mérite bien un (petit) cadeau, donc on a choisi un sauna. Attention JoliCode ne sera accepté que sur invitation !",
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
      And proposal "1" should be fusioned to proposal "17"
      And proposal "2" should be fusioned to proposal "17"
      And proposal "17" should have author "sfavot"

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
    When I send a POST request to "api/proposal_forms/1/proposals/2" with json:
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

  # Report

  @database
  Scenario: Anonymous API client wants to report a proposal
    When I send a POST request to "/api/proposals/1/reports" with a valid report json
    Then the JSON response status code should be 401

  @database
  Scenario: Logged in API client wants to report an proposal
    Given I am logged in to api as admin
    When I send a POST request to "/api/proposals/1/reports" with a valid report json
    Then the JSON response status code should be 201

  # Selections

  Scenario: Anonymous API client wants to get selections of a proposal
    When I send a GET request to "/api/proposals/1/selections"
    Then the JSON response should match:
    """
      [
        {
          "step": {
            "id": 6
          },
          "status": {
            "name": "Soumis au vote",
            "id": 4
          }
        }
      ]
    """
