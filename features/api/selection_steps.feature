@selection_steps
Feature: Selection steps

Scenario: Anonymous API client wants to get a step
  When I send a GET request to "/api/selection_steps/7"
  Then the JSON response should match:
  """
  {
    "projectId": @integer@,
    "position": @integer@,
    "open": @boolean@,
    "id": @integer@,
    "title": @string@,
    "enabled": @boolean@,
    "startAt": @string@,
    "endAt": @string@,
    "body": @string@,
    "statuses": [
      {
        "id": @integer@,
        "name": @string@,
        "color": @string@
      }
    ],
    "voteType": @integer@,
    "votesHelpText": @null@,
    "budget": @null@,
    "counters": {
      "proposals": @integer@,
      "remainingDays": @integer@
    },
    "_links": {
        "show": @string@
    },
    "status": @string@
  }
  """

  @elasticsearch
  Scenario: Logged in API client wants to get all proposals from a selection step
    Given I am logged in to api as user
    When I send a POST request to "/api/selection_steps/6/proposals/search" with json:
      """
      {
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
          "votesCount": @integer@,
          "enabled": @boolean@,
          "isTrashed": @boolean@,
          "title": @string@,
          "votesCountBySteps": @...@,
          "userHasVote": @boolean@,
          "_links": @...@
        },
        @...@
      ],
      "count": 3,
      "order": "random",
      "creditsLeft": @...@
    }
    """

  @elasticsearch
  Scenario: Anonymous API client wants to get all proposals from a selection step
    When I send a POST request to "/api/selection_steps/6/proposals/search" with json:
      """
      {
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
          "votesCount": @integer@,
          "enabled": @boolean@,
          "isTrashed": @boolean@,
          "title": @string@,
          "votesCountBySteps": @...@,
          "_links": @...@
        },
        @...@
      ],
      "count": 3,
      "order": "random",
      "creditsLeft": @...@
    }
    """

  @elasticsearch
  Scenario: Anonymous API client wants to get all proposals in a theme from a selection step filtered by theme
    When I send a POST request to "/api/selection_steps/6/proposals/search" with json:
    """
      {
        "filters": {
          "themes": 2
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
          "votesCount": @integer@,
          "enabled": @boolean@,
          "isTrashed": @boolean@,
          "title": @string@,
          "votesCountBySteps": @...@,
          "_links": @...@
        },
        @...@
      ],
      "count": 2,
      "order": "random",
      "creditsLeft": @...@
    }
    """
