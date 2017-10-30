@proposals
Feature: Proposal Restful Api

@parallel-scenario
Scenario: Anonymous API client wants to get one proposal from a ProposalForm and should not see private fields
  When I send a GET request to "/api/proposal_forms/proposalForm1/proposals/proposal1"
  Then the JSON response should match:
  """
  {
    "proposal": {
      "id": @string@,
      "reference": @string@,
      "body": @string@,
      "summary": @null@,
      "summaryOrBodyExcerpt": @string@,
      "updated_at": "@string@.isDateTime()",
      "estimation": @...@,
      "isDraft": @boolean@,
      "theme": {
        "id": @string@,
        "title": @string@,
        "enabled": @boolean@,
        "_links": {
          "show": @string@
        }
      },
      "district": {
        "id": @string@,
        "name": @string@
      },
      "status": {
        "id": @string@,
        "name": @string@,
        "color": @string@
      },
      "category": {
        "id": @string@,
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
          "settings": @string@
        }
      },
      "proposalForm": {
        "id": @string@
      },
      "address": @string@,
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
            "id": @string@,
            "projectId": @string@,
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
            "id": @string@,
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
  When I send a GET request to "/api/proposal_forms/proposalForm1/proposals/proposal1"
  Then the JSON response should match:
  """
  {
    "proposal": {
      "id": @string@,
      "reference": @string@,
      "body": @string@,
      "summary": @null@,
      "summaryOrBodyExcerpt": @string@,
      "updated_at": "@string@.isDateTime()",
      "estimation": @...@,
      "theme": {
        "id": @string@,
        "title": @string@,
        "enabled": @boolean@,
        "_links": {
          "show": @string@
        }
      },
      "district": {
        "id": @string@,
        "name": @string@
      },
      "address": @string@,
      "status": {
        "id": @string@,
        "name": @string@,
        "color": @string@
      },
      "category": {
        "id": @string@,
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
        "id": @string@
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
            "id": @string@,
            "projectId": @string@,
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
            "id": @string@,
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
      "votesByStepId": {
        "selectionstep1": [],
        "collectstep1": []
      },
      "votableStepId": "selectionstep1",
      "votesCountByStepId": {
        "selectionstep1": 0,
        "collectstep1": 0
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
  When I send a GET request to "/api/proposal_forms/proposalForm1/proposals/proposal1"
  Then the JSON response should match:
  """
  {
    "proposal": {
      "id": @string@,
      "reference": @string@,
      "body": @string@,
      "summary": @null@,
      "summaryOrBodyExcerpt": @string@,
      "updated_at": "@string@.isDateTime()",
      "estimation": @...@,
      "theme": {
        "id": @string@,
        "title": @string@,
        "enabled": @boolean@,
        "_links": {
          "show": @string@
        }
      },
      "district": {
        "id": @string@,
        "name": @string@
      },
      "address": @string@,
      "status": {
        "id": @string@,
        "name": @string@,
        "color": @string@
      },
      "category": {
        "id": @string@,
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
        "id": @string@
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
            "id": @string@,
            "projectId": @string@,
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
            "id": @string@,
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
  When I send a POST request to "/api/collect_steps/collectstep1/proposals/search?page=1&pagination=50&order=old" with json:
  """
  {}
  """
  Then the JSON response should match:
  """
  {
    "proposals": [
      {
        "id": @string@,
        "reference": @string@,
        "body": @string@,
        "summaryOrBodyExcerpt": @string@,
        "updated_at": "@string@.isDateTime()",
        "theme": {
          "id": @string@,
          "title": @string@,
          "enabled": @boolean@,
          "_links": @...@
        },
        "district": {
          "id": @string@,
          "name": @string@
        },
        "status": {
          "id": @string@,
          "name": @string@,
          "color": @string@
        },
        "category": {
          "id": @string@,
          "name": @string@
        },
        "author": @...@,
        "proposalForm": {
          "id": @string@
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
    "count": 6,
    "order": "old"
  }
  """

@elasticsearch
Scenario: Logged in API client wants to get all proposals from a private collect step
  Given I am logged in to api as user
  When I send a POST request to "/api/collect_steps/collectstep4/proposals/search?page=1&pagination=50&order=old" with json:
  """
  {}
  """
  Then the JSON response should match:
  """
  {
    "proposals": [
      {
        "id": @string@,
        "reference": @string@,
        "body": @string@,
        "summaryOrBodyExcerpt": @string@,
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
          "id": @string@
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
  When I send a POST request to "/api/collect_steps/collectstep4/proposals/search?page=1&pagination=50&order=old" with json:
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
  When I send a POST request to "/api/collect_steps/collectstep1/proposals/search?order=last" with json:
  """
  {
    "terms": null,
    "filters": {
      "categories": "pCategory2"
    }
  }
  """
  Then the JSON response should match:
  """
  {
    "proposals": [
      {
        "id": @string@,
        "reference": @string@,
        "body": @string@,
        "summaryOrBodyExcerpt": @string@,
        "updated_at": "@string@.isDateTime()",
        "theme": {
          "id": @string@,
          "title": @string@,
          "enabled": @boolean@,
          "_links": @...@
        },
        "district": {
          "id": @string@,
          "name": @string@
        },
        "status": {
          "id": @string@,
          "name": @string@,
          "color": @string@
        },
        "category": {
          "id": "pCategory2",
          "name": "Politique"
        },
        "author": @...@,
        "proposalForm": {
          "id": @string@
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
        "reference": @string@,
        "body": @string@,
        "summaryOrBodyExcerpt": @string@,
        "updated_at": "@string@.isDateTime()",
        "theme": {
          "id": @string@,
          "title": @string@,
          "enabled": @boolean@,
          "_links": @...@
        },
        "district": {
          "id": @string@,
          "name": @string@
        },
        "status": {
          "id": @integer@,
          "name": @string@,
          "color": @string@
        },
        "category": {
          "id": "pCategory2",
          "name": "Politique"
        },
        "author": @...@,
        "proposalForm": {
          "id": @string@
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
      }
    ],
    "count": 2,
    "order": "last"
  }
  """

@elasticsearch
Scenario: Anonymous API client wants to get some proposals from a collect step
  When I send a POST request to "/api/collect_steps/collectstep1/proposals/search-in" with json:
  """
  {
    "ids": [
      "proposal10", "proposal1"
    ]
  }
  """
  Then the JSON response should match:
  """
  {
    "proposals": [
      {
          "summaryOrBodyExcerpt": @string@,
          "reference": @string@,
          "updated_at": "@string@.isDateTime()",
          "isDraft": @boolean@,
          "author": {
              "username": @string@,
              "displayName": @string@,
              "uniqueId": @string@,
              "isAdmin": @boolean@,
              "user_type": {
                  "name": @string@,
                  "slug": @string@,
                  "id": @integer@
              },
              "vip": @boolean@,
              "_links": {
                  "settings": @string@
              }
          },
          "proposalForm": {
              "id": @string@
          },
          "likers": @array@,
          "theme": {
              "title": @string@,
              "enabled": @boolean@,
              "id": @string@,
              "_links": {
                  "show": @string@
              }
          },
          "district": {
              "name": @string@,
              "id": @string@
          },
          "status": {
              "name": @string@,
              "id": @string@,
              "color": @string@
          },
          "comments": @array@,
          "selections": @array@,
          "estimation": @integer@,
          "progressSteps": @array@,
          "id": "proposal10",
          "comments_count": @integer@,
          "created_at": "@string@.isDateTime()",
          "enabled": @boolean@,
          "isTrashed": @boolean@,
          "title": @string@,
          "body": @string@,
          "_links": {
              "show": @string@,
              "index": @string@
          },
          "votesCountByStepId": {
              "selectionstep6": @integer@,
              "collectstep1": @integer@
          },
          "votesByStepId": {
              "selectionstep6": @array@,
              "collectstep1": @array@
          },
          "responses": @array@,
          "votableStepId": @string@,
          "reference": "@string@"
      },
      {
          "summaryOrBodyExcerpt": @string@,
          "reference": @string@,
          "isDraft": @boolean@,
          "updated_at": "@string@.isDateTime()",
          "author": {
              "username": @string@,
              "displayName": @string@,
              "uniqueId": @string@,
              "isAdmin": @boolean@,
              "media": {
                  "url": @string@
              },
              "user_type": {
                  "name": @string@,
                  "slug": @string@,
                  "id": @integer@
              },
              "vip": @boolean@,
              "_links": {
                  "settings": @string@
              }
          },
          "proposalForm": {
              "id": @string@
          },
          "likers": @array@,
          "address": @string@,
          "theme": {
              "title": @string@,
              "enabled": @boolean@,
              "id": @string@,
              "_links": {
                  "show": @string@
              }
          },
          "district": {
              "name": @string@,
              "id": @string@
          },
          "status": {
              "name": @string@,
              "id": @string@,
              "color": @string@
          },
          "category": {
              "name": @string@,
              "id": @string@
          },
          "comments": @array@,
          "selections": @array@,
          "progressSteps": @array@,
          "id": "proposal1",
          "comments_count": @integer@,
          "created_at": "@string@.isDateTime()",
          "enabled": @boolean@,
          "isTrashed": @boolean@,
          "title": @string@,
          "body": @string@,
          "_links": {
              "show": @string@,
              "index": @string@
          },
          "votesCountByStepId": {
              "selectionstep1": @integer@,
              "collectstep1": @integer@
          },
          "votesByStepId": {
              "selectionstep1": @array@,
              "collectstep1": @array@
          },
          "responses": @array@,
          "votableStepId": @string@,
          "reference": "@string@"
      }
    ],
    "count": 2
  }
  """

@elasticsearch @security
Scenario: Anonymous API client wants to get some proposals from a collect step without define ids
  When I send a POST request to "/api/collect_steps/collectstep1/proposals/search-in" with json:
  """
  {
  }
  """
  Then the JSON response should match:
  """
  {
    "code": 400,
    "message": "Bad Request",
    "errors": null
  }
  """

@elasticsearch
Scenario: Anonymous API client wants to get some selection proposals from a collect step
  When I send a POST request to "/api/selection_steps/selectionstep1/proposals/search-in" with json:
  """
  {
    "ids": [
      "proposal3", "proposal2"
    ]
  }
  """
  Then the JSON response should match:
  """
  {
    "proposals": [
      {
        "summaryOrBodyExcerpt": @string@,
        "reference": @string@,
        "updated_at": "@string@.isDateTime()",
        "author": @wildcard@,
        "proposalForm": @wildcard@,
        "likers": @array@,
        "address": @string@,
        "theme": @wildcard@,
        "district": @wildcard@,
        "status": @wildcard@,
        "category": @wildcard@,
        "comments": @array@,
        "selections": @array@,
        "progressSteps": @array@,
        "id": "proposal3",
        "comments_count": @integer@,
        "created_at": "@string@.isDateTime()",
        "enabled": @boolean@,
        "isTrashed": @boolean@,
        "title": @string@,
        "body": @string@,
        "summary": @string@,
        "isDraft": @boolean@,
        "_links": @wildcard@,
        "votesCountByStepId": @wildcard@,
        "votesByStepId": @wildcard@,
        "responses": @array@,
        "votableStepId": @string@,
      },
      {
        "summaryOrBodyExcerpt": @string@,
        "reference": @string@,
        "updated_at": "@string@.isDateTime()",
        "author": @wildcard@,
        "proposalForm": @wildcard@,
        "likers": @array@,
        "address": @string@,
        "theme": @wildcard@,
        "district": @wildcard@,
        "status": @wildcard@,
        "category": @wildcard@,
        "comments": @array@,
        "selections": @array@,
        "progressSteps": @array@,
        "id": "proposal2",
        "comments_count": @integer@,
        "created_at": "@string@.isDateTime()",
        "enabled": @boolean@,
        "isTrashed": @boolean@,
        "title": @string@,
        "body": @string@,
        "isDraft": @boolean@,
        "_links": @wildcard@,
        "votesCountByStepId": @wildcard@,
        "votesByStepId": @wildcard@,
        "responses": @array@,
        "votableStepId": @string@,
      }
    ],
    "count": 2
  }
  """

@elasticsearch @security
Scenario: Anonymous API client wants to get some proposals from a selection step without define ids
  When I send a POST request to "/api/selection_steps/selectionstep1/proposals/search-in" with json:
  """
  {
  }
  """
  Then the JSON response should match:
  """
  {
    "code": 400,
    "message": "Bad Request",
    "errors": null
  }
  """

# Create proposal
@database
Scenario: Logged in API client wants to add a proposal (with no value for not required response)
  Given I am logged in to api as user
  Given feature themes is enabled
  Given feature districts is enabled
  When I send a POST request to "/api/proposal_forms/proposalForm1/proposals" with json:
  """
  {
    "title": "Acheter un sauna pour Capco",
    "body": "Avec tout le travail accompli, on mérite bien un (petit) cadeau, donc on a choisi un sauna. Attention JoliCode ne sera accepté que sur invitation !",
    "theme": "theme1",
    "district": "district1",
    "category": "pCategory1",
    "address": "[{\"address_components\":[{\"long_name\":\"262\",\"short_name\":\"262\",\"types\":[\"street_number\"]},{\"long_name\":\"Avenue Général Leclerc\",\"short_name\":\"Avenue Général Leclerc\",\"types\":[\"route\"]},{\"long_name\":\"Rennes\",\"short_name\":\"Rennes\",\"types\":[\"locality\",\"political\"]},{\"long_name\":\"Ille-et-Vilaine\",\"short_name\":\"Ille-et-Vilaine\",\"types\":[\"administrative_area_level_2\",\"political\"]},{\"long_name\":\"Bretagne\",\"short_name\":\"Bretagne\",\"types\":[\"administrative_area_level_1\",\"political\"]},{\"long_name\":\"France\",\"short_name\":\"FR\",\"types\":[\"country\",\"political\"]},{\"long_name\":\"35700\",\"short_name\":\"35700\",\"types\":[\"postal_code\"]}],\"formatted_address\":\"262 Avenue Général Leclerc, 35700 Rennes, France\",\"geometry\":{\"bounds\":{\"northeast\":{\"lat\":48.1140978,\"lng\":-1.6404985},\"southwest\":{\"lat\":48.1140852,\"lng\":-1.640499}},\"location\":{\"lat\":48.1140852,\"lng\":-1.6404985},\"location_type\":\"RANGE_INTERPOLATED\",\"viewport\":{\"northeast\":{\"lat\":48.1154404802915,\"lng\":-1.639149769708498},\"southwest\":{\"lat\":48.1127425197085,\"lng\":-1.641847730291502}}},\"place_id\":\"EjIyNjIgQXZlbnVlIEfDqW7DqXJhbCBMZWNsZXJjLCAzNTcwMCBSZW5uZXMsIEZyYW5jZQ\",\"types\":[\"street_address\"]}]",
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

@database @media
Scenario: Logged in API client wants to add a proposal with documents and illustration
  Given I am logged in to api as user
  Given feature themes is enabled
  Given feature districts is enabled
  And I should have 24 files in media folder
  And I should have 0 files in source media folder
  When I send a POST request to "/api/proposal_forms/proposalForm1/proposals" with a document and an illustration
  Then the JSON response status code should be 201
  And I should have 25 files in media folder
  And I should have 1 files in source media folder

@database
Scenario: Logged in admin API client wants to add a proposal with fusion
  Given I am logged in to api as admin
  Given feature themes is enabled
  Given feature districts is enabled
  When I send a POST request to "/api/proposal_forms/proposalForm1/proposals" with json:
  """
  {
    "author": "user2",
    "childConnections": ["proposal1", "proposal2"],
    "title": "Acheter un sauna pour Capco",
    "body": "Avec tout le travail accompli, on mérite bien un (petit) cadeau, donc on a choisi un sauna. Attention JoliCode ne sera accepté que sur invitation !",
    "theme": "theme1",
    "district": "district1",
    "category": "pCategory1",
    "address": "[{\"address_components\":[{\"long_name\":\"262\",\"short_name\":\"262\",\"types\":[\"street_number\"]},{\"long_name\":\"Avenue Général Leclerc\",\"short_name\":\"Avenue Général Leclerc\",\"types\":[\"route\"]},{\"long_name\":\"Rennes\",\"short_name\":\"Rennes\",\"types\":[\"locality\",\"political\"]},{\"long_name\":\"Ille-et-Vilaine\",\"short_name\":\"Ille-et-Vilaine\",\"types\":[\"administrative_area_level_2\",\"political\"]},{\"long_name\":\"Bretagne\",\"short_name\":\"Bretagne\",\"types\":[\"administrative_area_level_1\",\"political\"]},{\"long_name\":\"France\",\"short_name\":\"FR\",\"types\":[\"country\",\"political\"]},{\"long_name\":\"35700\",\"short_name\":\"35700\",\"types\":[\"postal_code\"]}],\"formatted_address\":\"262 Avenue Général Leclerc, 35700 Rennes, France\",\"geometry\":{\"bounds\":{\"northeast\":{\"lat\":48.1140978,\"lng\":-1.6404985},\"southwest\":{\"lat\":48.1140852,\"lng\":-1.640499}},\"location\":{\"lat\":48.1140852,\"lng\":-1.6404985},\"location_type\":\"RANGE_INTERPOLATED\",\"viewport\":{\"northeast\":{\"lat\":48.1154404802915,\"lng\":-1.639149769708498},\"southwest\":{\"lat\":48.1127425197085,\"lng\":-1.641847730291502}}},\"place_id\":\"EjIyNjIgQXZlbnVlIEfDqW7DqXJhbCBMZWNsZXJjLCAzNTcwMCBSZW5uZXMsIEZyYW5jZQ\",\"types\":[\"street_address\"]}]",
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
  And proposal "proposal1" should be fusioned to the last inserted proposal
  And proposal "proposal2" should be fusioned to the last inserted proposal
  And the last inserted proposal should have author "sfavot"

@database
Scenario: Logged in API client wants to add a proposal (with nothing for not required response)
  Given I am logged in to api as user
  Given feature themes is enabled
  Given feature districts is enabled
  When I send a POST request to "/api/proposal_forms/proposalForm1/proposals" with json:
  """
  {
    "title": "Acheter un sauna pour Capco",
    "body": "Avec tout le travail accompli, on mérite bien un (petit) cadeau, donc on a choisi un sauna. Attention JoliCode ne sera accepté que sur invitation !",
    "theme": "theme1",
    "district": "district1",
    "category": "pCategory1",
    "address": "[{\"address_components\":[{\"long_name\":\"262\",\"short_name\":\"262\",\"types\":[\"street_number\"]},{\"long_name\":\"Avenue Général Leclerc\",\"short_name\":\"Avenue Général Leclerc\",\"types\":[\"route\"]},{\"long_name\":\"Rennes\",\"short_name\":\"Rennes\",\"types\":[\"locality\",\"political\"]},{\"long_name\":\"Ille-et-Vilaine\",\"short_name\":\"Ille-et-Vilaine\",\"types\":[\"administrative_area_level_2\",\"political\"]},{\"long_name\":\"Bretagne\",\"short_name\":\"Bretagne\",\"types\":[\"administrative_area_level_1\",\"political\"]},{\"long_name\":\"France\",\"short_name\":\"FR\",\"types\":[\"country\",\"political\"]},{\"long_name\":\"35700\",\"short_name\":\"35700\",\"types\":[\"postal_code\"]}],\"formatted_address\":\"262 Avenue Général Leclerc, 35700 Rennes, France\",\"geometry\":{\"bounds\":{\"northeast\":{\"lat\":48.1140978,\"lng\":-1.6404985},\"southwest\":{\"lat\":48.1140852,\"lng\":-1.640499}},\"location\":{\"lat\":48.1140852,\"lng\":-1.6404985},\"location_type\":\"RANGE_INTERPOLATED\",\"viewport\":{\"northeast\":{\"lat\":48.1154404802915,\"lng\":-1.639149769708498},\"southwest\":{\"lat\":48.1127425197085,\"lng\":-1.641847730291502}}},\"place_id\":\"EjIyNjIgQXZlbnVlIEfDqW7DqXJhbCBMZWNsZXJjLCAzNTcwMCBSZW5uZXMsIEZyYW5jZQ\",\"types\":[\"street_address\"]}]",
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
Scenario: Logged in API client wants to add a proposal not in zone
  Given I am logged in to api as user
  Given feature themes is enabled
  Given feature districts is enabled
  When I send a POST request to "/api/proposal_forms/proposalForm1/proposals" with json:
  """
    {
      "title": "Acheter un sauna pour Capco",
      "body": "Avec tout le travail accompli, on mérite bien un (petit) cadeau, donc on a choisi un sauna. Attention JoliCode ne sera accepté que sur invitation !",
      "theme": "theme1",
      "district": "district1",
      "category": "pCategory1",
      "address": "[{\"address_components\":[{\"long_name\":\"18\",\"short_name\":\"18\",\"types\":[\"street_number\"]},{\"long_name\":\"Avenue Parmentier\",\"short_name\":\"Avenue Parmentier\",\"types\":[\"route\"]},{\"long_name\":\"Paris\",\"short_name\":\"Paris\",\"types\":[\"locality\",\"political\"]},{\"long_name\":\"Paris\",\"short_name\":\"Paris\",\"types\":[\"administrative_area_level_2\",\"political\"]},{\"long_name\":\"\u00CEle-de-France\",\"short_name\":\"\u00CEle-de-France\",\"types\":[\"administrative_area_level_1\",\"political\"]},{\"long_name\":\"France\",\"short_name\":\"FR\",\"types\":[\"country\",\"political\"]},{\"long_name\":\"75011\",\"short_name\":\"75011\",\"types\":[\"postal_code\"]}],\"formatted_address\":\"18 Avenue Parmentier, 75011 Paris, France\",\"geometry\":{\"location\":{\"lat\":48.8599104,\"lng\":2.3791948},\"location_type\":\"ROOFTOP\",\"viewport\":{\"northeast\":{\"lat\":48.8612593802915,\"lng\":2.380543780291502},\"southwest\":{\"lat\":48.8585614197085,\"lng\":2.377845819708498}}},\"place_id\":\"ChIJC5NyT_dt5kcRq3u4vOAhdQs\",\"types\":[\"street_address\"]}]",
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
  Then the JSON response status code should be 400
  And the JSON response should match:
  """
  {"code":400,"message":"Validation Failed","errors":{"errors":["global.address_not_in_zone"],"children":{"title":[],"summary":[],"body":[],"theme":[],"district":[],"category":[],"address":[],"responses":{"children":[{"children":{"value":[],"question":[],"_type":[]}},{"children":{"value":[],"question":[],"_type":[]}}]}}}}
  """

@database
Scenario: Admin API client wants to update proposal status
  Given I am logged in to api as admin
  When I send a PATCH request to "/api/proposals/proposal12" with json:
  """
  {
    "status": "status1"
  }
  """
  Then the JSON response status code should be 200
  And proposal "proposal12" should have status "status1"
  When I send a PATCH request to "/api/proposals/proposal12" with json:
  """
  {
    "status": null
  }
  """
  Then the JSON response status code should be 204
  And proposal "proposal12" should not have a status

@security
Scenario: Logged in API client wants to add a proposal without a required response
  Given I am logged in to api as user
  Given feature themes is enabled
  Given feature districts is enabled
  When I send a POST request to "/api/proposal_forms/proposalForm1/proposals" with json:
  """
  {
    "title": "Acheter un sauna pour Capco",
    "body": "Avec tout le travail accompli, on mérite bien un (petit) cadeau, donc on a choisi un sauna. Attention JoliCode ne sera accepté que sur invitation !",
    "theme": "theme1",
    "district": "district1",
    "category": "pCategory1",
    "address": "[{\"address_components\":[{\"long_name\":\"262\",\"short_name\":\"262\",\"types\":[\"street_number\"]},{\"long_name\":\"Avenue Général Leclerc\",\"short_name\":\"Avenue Général Leclerc\",\"types\":[\"route\"]},{\"long_name\":\"Rennes\",\"short_name\":\"Rennes\",\"types\":[\"locality\",\"political\"]},{\"long_name\":\"Ille-et-Vilaine\",\"short_name\":\"Ille-et-Vilaine\",\"types\":[\"administrative_area_level_2\",\"political\"]},{\"long_name\":\"Bretagne\",\"short_name\":\"Bretagne\",\"types\":[\"administrative_area_level_1\",\"political\"]},{\"long_name\":\"France\",\"short_name\":\"FR\",\"types\":[\"country\",\"political\"]},{\"long_name\":\"35700\",\"short_name\":\"35700\",\"types\":[\"postal_code\"]}],\"formatted_address\":\"262 Avenue Général Leclerc, 35700 Rennes, France\",\"geometry\":{\"bounds\":{\"northeast\":{\"lat\":48.1140978,\"lng\":-1.6404985},\"southwest\":{\"lat\":48.1140852,\"lng\":-1.640499}},\"location\":{\"lat\":48.1140852,\"lng\":-1.6404985},\"location_type\":\"RANGE_INTERPOLATED\",\"viewport\":{\"northeast\":{\"lat\":48.1154404802915,\"lng\":-1.639149769708498},\"southwest\":{\"lat\":48.1127425197085,\"lng\":-1.641847730291502}}},\"place_id\":\"EjIyNjIgQXZlbnVlIEfDqW7DqXJhbCBMZWNsZXJjLCAzNTcwMCBSZW5uZXMsIEZyYW5jZQ\",\"types\":[\"street_address\"]}]",
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
        "proposal.missing_required_responses"
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
  When I send a POST request to "/api/proposal_forms/proposalForm1/proposals" with json:
  """
  {
    "title": "Acheter un sauna pour Capco",
    "body": "Avec tout le travail accompli, on mérite bien un (petit) cadeau, donc on a choisi un sauna. Attention JoliCode ne sera accepté que sur invitation !",
    "theme": "theme1",
    "district": "district1",
    "category": "pCategory1",
    "address": "[{\"address_components\":[{\"long_name\":\"262\",\"short_name\":\"262\",\"types\":[\"street_number\"]},{\"long_name\":\"Avenue Général Leclerc\",\"short_name\":\"Avenue Général Leclerc\",\"types\":[\"route\"]},{\"long_name\":\"Rennes\",\"short_name\":\"Rennes\",\"types\":[\"locality\",\"political\"]},{\"long_name\":\"Ille-et-Vilaine\",\"short_name\":\"Ille-et-Vilaine\",\"types\":[\"administrative_area_level_2\",\"political\"]},{\"long_name\":\"Bretagne\",\"short_name\":\"Bretagne\",\"types\":[\"administrative_area_level_1\",\"political\"]},{\"long_name\":\"France\",\"short_name\":\"FR\",\"types\":[\"country\",\"political\"]},{\"long_name\":\"35700\",\"short_name\":\"35700\",\"types\":[\"postal_code\"]}],\"formatted_address\":\"262 Avenue Général Leclerc, 35700 Rennes, France\",\"geometry\":{\"bounds\":{\"northeast\":{\"lat\":48.1140978,\"lng\":-1.6404985},\"southwest\":{\"lat\":48.1140852,\"lng\":-1.640499}},\"location\":{\"lat\":48.1140852,\"lng\":-1.6404985},\"location_type\":\"RANGE_INTERPOLATED\",\"viewport\":{\"northeast\":{\"lat\":48.1154404802915,\"lng\":-1.639149769708498},\"southwest\":{\"lat\":48.1127425197085,\"lng\":-1.641847730291502}}},\"place_id\":\"EjIyNjIgQXZlbnVlIEfDqW7DqXJhbCBMZWNsZXJjLCAzNTcwMCBSZW5uZXMsIEZyYW5jZQ\",\"types\":[\"street_address\"]}]",
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
          "proposal.missing_required_responses"
        ],
        "children": @...@
    }
  }
  """

@security
Scenario: Logged in API client wants to add a proposal with no category when mandatory
  Given I am logged in to api as user
  And features themes, districts are enabled
  When I send a POST request to "/api/proposal_forms/proposalForm1/proposals" with json:
  """
  {
    "title": "Acheter un sauna pour Capco",
    "body": "Avec tout le travail accompli, on mérite bien un (petit) cadeau, donc on a choisi un sauna. Attention JoliCode ne sera accepté que sur invitation !",
    "theme": "theme1",
    "district": "district1",
    "address": "[{\"address_components\":[{\"long_name\":\"262\",\"short_name\":\"262\",\"types\":[\"street_number\"]},{\"long_name\":\"Avenue Général Leclerc\",\"short_name\":\"Avenue Général Leclerc\",\"types\":[\"route\"]},{\"long_name\":\"Rennes\",\"short_name\":\"Rennes\",\"types\":[\"locality\",\"political\"]},{\"long_name\":\"Ille-et-Vilaine\",\"short_name\":\"Ille-et-Vilaine\",\"types\":[\"administrative_area_level_2\",\"political\"]},{\"long_name\":\"Bretagne\",\"short_name\":\"Bretagne\",\"types\":[\"administrative_area_level_1\",\"political\"]},{\"long_name\":\"France\",\"short_name\":\"FR\",\"types\":[\"country\",\"political\"]},{\"long_name\":\"35700\",\"short_name\":\"35700\",\"types\":[\"postal_code\"]}],\"formatted_address\":\"262 Avenue Général Leclerc, 35700 Rennes, France\",\"geometry\":{\"bounds\":{\"northeast\":{\"lat\":48.1140978,\"lng\":-1.6404985},\"southwest\":{\"lat\":48.1140852,\"lng\":-1.640499}},\"location\":{\"lat\":48.1140852,\"lng\":-1.6404985},\"location_type\":\"RANGE_INTERPOLATED\",\"viewport\":{\"northeast\":{\"lat\":48.1154404802915,\"lng\":-1.639149769708498},\"southwest\":{\"lat\":48.1127425197085,\"lng\":-1.641847730291502}}},\"place_id\":\"EjIyNjIgQXZlbnVlIEfDqW7DqXJhbCBMZWNsZXJjLCAzNTcwMCBSZW5uZXMsIEZyYW5jZQ\",\"types\":[\"street_address\"]}]",
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
          "global.no_category_when_mandatory"
        ],
        "children": @...@
    }
  }
  """

@security
Scenario: Logged in API client wants to add a proposal with no address when mandatory
  Given I am logged in to api as user
  And features themes, districts are enabled
  When I send a POST request to "/api/proposal_forms/proposalForm1/proposals" with json:
  """
  {
    "title": "Acheter un sauna pour Capco",
    "body": "Avec tout le travail accompli, on mérite bien un (petit) cadeau, donc on a choisi un sauna. Attention JoliCode ne sera accepté que sur invitation !",
    "theme": "theme1",
    "district": "district1",
    "category": "pCategory1",
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
          "global.no_address_when_mandatory"
        ],
        "children": @...@
    }
  }
  """

@database
Scenario: logged in API client wants to edit a proposal
  Given I am logged in to api as user
  When I send a POST request to "api/proposal_forms/proposalForm1/proposals/proposal2" with json:
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
  When I send a DELETE request to "api/proposal_forms/proposalForm1/proposals/proposal2"
  Then the JSON response status code should be 204

@database
Scenario: logged in API client wants to remove a proposal and ensure that its proposal was disabled
  Given I am logged in to api as user
  When I send a DELETE request to "api/proposal_forms/proposalForm4/proposals/proposal12"
  Then the JSON response status code should be 204
  And proposal with id "proposal12" should be deleted

# Report
@database
Scenario: Anonymous API client wants to report a proposal
  When I send a POST request to "/api/proposals/proposal1/reports" with a valid report json
  Then the JSON response status code should be 401

@database
Scenario: Logged in API client wants to report an proposal
  Given I am logged in to api as admin
  When I send a POST request to "/api/proposals/proposal1/reports" with a valid report json
  Then the JSON response status code should be 201

# Selections
Scenario: Anonymous API client wants to get selections of a proposal
  When I send a GET request to "/api/proposals/proposal1/selections"
  Then the JSON response should match:
  """
    [
      {
        "step": {
          "id": "selectionStep6",
          "statuses": @...@
        },
        "status": {
          "color": @string@,
          "name": "Soumis au vote",
          "id": "status4"
        }
      }
    ]
  """
