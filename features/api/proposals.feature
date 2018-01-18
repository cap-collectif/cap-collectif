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
      "updatedAt": "@string@.isDateTime()",
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
        "userType": {
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
          "updatedAt": "@string@.isDateTime()"
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
          "updatedAt": "@string@.isDateTime()"
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
      "commentsCount": @integer@,
      "createdAt": "@string@.isDateTime()",
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
      "updatedAt": "@string@.isDateTime()",
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
        "userType": {
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
          "updatedAt": "@string@.isDateTime()"
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
          "updatedAt": "@string@.isDateTime()"
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
          "updatedAt": "@string@.isDateTime()"
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
      "commentsCount": @integer@,
      "createdAt": "@string@.isDateTime()",
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
      "updatedAt": "@string@.isDateTime()",
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
        "userType": {
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
          "updatedAt": "@string@.isDateTime()"
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
          "updatedAt": "@string@.isDateTime()"
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
          "updatedAt": "@string@.isDateTime()"
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
      "commentsCount": @integer@,
      "createdAt": "@string@.isDateTime()",
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
        "updatedAt": "@string@.isDateTime()",
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
        "commentsCount": @integer@,
        "createdAt": "@string@.isDateTime()",
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
        "address": @null@,
        "summaryOrBodyExcerpt": @string@,
        "updatedAt": "@string@.isDateTime()",
        "theme": @...@,
        "district": @...@,
        "status": @...@,
        "author": {
          "username": "user",
          "displayName": "user",
          "uniqueId": "user",
          "isAdmin": false,
          "userType": @...@,
          "media": @null@,
          "vip": false
        },
        "proposalForm": {
          "id": @string@
        },
        "comments": @...@,
        "responses": @...@,
        "selections": @...@,
        "commentsCount": @integer@,
        "createdAt": "@string@.isDateTime()",
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
        "updatedAt": "@string@.isDateTime()",
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
        "commentsCount": @integer@,
        "createdAt": "@string@.isDateTime()",
        "enabled": @boolean@,
        "estimation": @wildcard@,
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
        "estimation": @wildcard@,
        "updatedAt": "@string@.isDateTime()",
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
        "commentsCount": @integer@,
        "createdAt": "@string@.isDateTime()",
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
          "updatedAt": "@string@.isDateTime()",
          "isDraft": @boolean@,
          "address": @null@,
          "summary": @null@,
          "estimation": @null@,
          "author": {
              "username": @string@,
              "displayName": @string@,
              "uniqueId": @string@,
              "isAdmin": @boolean@,
              "userType": {
                  "name": @string@,
                  "slug": @string@,
                  "id": @integer@
              },
              "media": @null@,
              "vip": @boolean@,
              "_links": {
                  "settings": @string@
              }
          },
          "proposalForm": {
              "id": @string@
          },
          "likers": @array@,
          "category": @null@,
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
          "trashedReason": @null@,
          "progressSteps": @array@,
          "id": "proposal10",
          "commentsCount": @integer@,
          "createdAt": "@string@.isDateTime()",
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
          "estimation": @null@,
          "summary": @null@,
          "address": @null@,
          "reference": @string@,
          "isDraft": @boolean@,
          "updatedAt": "@string@.isDateTime()",
          "author": {
              "username": @string@,
              "displayName": @string@,
              "uniqueId": @string@,
              "isAdmin": @boolean@,
              "media": {
                  "url": @string@
              },
              "userType": {
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
          "category": @wildcard@,
          "comments": @array@,
          "selections": @array@,
          "progressSteps": @array@,
          "id": "proposal1",
          "commentsCount": @integer@,
          "createdAt": "@string@.isDateTime()",
          "enabled": @boolean@,
          "isTrashed": @boolean@,
          "trashedReason": @null@,
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
        "updatedAt": "@string@.isDateTime()",
        "author": @wildcard@,
        "estimation": @...@,
        "summary": @null@,
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
        "commentsCount": @integer@,
        "createdAt": "@string@.isDateTime()",
        "enabled": @boolean@,
        "isTrashed": @boolean@,
        "title": @string@,
        "body": @string@,
        "summary": @string@,
        "isDraft": @boolean@,
        "trashedReason": @null@,
        "_links": @wildcard@,
        "votesCountByStepId": @wildcard@,
        "votesByStepId": @wildcard@,
        "responses": @array@,
        "votableStepId": @string@
      },
      {
        "summaryOrBodyExcerpt": @string@,
        "reference": @string@,
        "summary": @null@,
        "estimation": @wildcard@,
        "updatedAt": "@string@.isDateTime()",
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
        "commentsCount": @integer@,
        "createdAt": "@string@.isDateTime()",
        "enabled": @boolean@,
        "isTrashed": @boolean@,
        "trashedReason": @null@,
        "title": @string@,
        "body": @string@,
        "isDraft": @boolean@,
        "_links": @wildcard@,
        "votesCountByStepId": @wildcard@,
        "votesByStepId": @wildcard@,
        "responses": @array@,
        "votableStepId": @string@
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
