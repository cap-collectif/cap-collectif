@selection_steps
Feature: Selection steps

Scenario: Anonymous API client wants to get a step
  When I send a GET request to "/api/selection_steps/selectionstep2"
  Then the JSON response should match:
  """
  {
    "projectId": @string@,
    "position": @integer@,
    "open": @boolean@,
    "id": @string@,
    "title": @string@,
    "enabled": @boolean@,
    "timeless": @boolean@,
    "voteThreshold": @integer@,
    "startAt": @string@,
    "endAt": @string@,
    "body": @string@,
    "statuses": [
      {
        "id": @string@,
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
  When I send a POST request to "/api/selection_steps/selectionstep1/proposals/search" with json:
  """
  {
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
        "_links": @...@
      },
      @...@
    ],
    "count": 3,
    "order": "random"
  }
  """

@elasticsearch
Scenario: Anonymous API client wants to get all proposals from a selection step
  When I send a POST request to "/api/selection_steps/selectionstep1/proposals/search" with json:
  """
  {
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
        "_links": @...@
      },
      @...@
    ],
    "count": 3,
    "order": "random"
  }
  """

@elasticsearch
Scenario: Anonymous API client wants to get all proposals in a theme from a selection step filtered by theme
  When I send a POST request to "/api/selection_steps/selectionstep1/proposals/search" with json:
  """
  {
    "filters": {
      "themes": "theme2"
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
        "reference": @string@,
        "_links": @...@
      },
      @...@
    ],
    "count": 2,
    "order": "random"
  }
  """

@database
Scenario: Admin API client wants add, then delete a selection
  Given I am logged in to api as admin
  When I send a POST request to "/api/selection_steps/selectionstep1/selections" with json:
  """
  {
    "proposal": "proposal8"
  }
  """
  Then the JSON response status code should be 201
  And proposal "proposal8" should be selected in selection step "selectionstep1"
  When I send a DELETE request to "/api/selection_steps/selectionstep1/selections/proposal8"
  Then the JSON response status code should be 204
  And proposal "proposal8" should not be selected in selection step "selectionstep1"

@database
Scenario: Admin API client wants to update proposal status
  Given I am logged in to api as admin
  When I send a PATCH request to "/api/selection_steps/selectionstep1/selections/proposal3" with json:
  """
  {
    "status": "status1"
  }
  """
  Then the JSON response status code should be 204
  And selection "selectionstep1" "proposal3" should have status "status1"
  When I send a PATCH request to "/api/selection_steps/selectionstep1/selections/proposal3" with json:
  """
  {
    "status": null
  }
  """
  Then the JSON response status code should be 204
  And selection "selectionstep1" "proposal3" should have no status
