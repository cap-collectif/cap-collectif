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
        "id": @integer@,
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
        "id": @integer@,
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
        "id": @integer@,
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
    "proposal": 8
  }
  """
  Then the JSON response status code should be 201
  And proposal "8" should be selected in selection step "selectionstep1"
  When I send a DELETE request to "/api/selection_steps/selectionstep1/selections/8"
  Then the JSON response status code should be 204
  And proposal "8" should not be selected in selection step "selectionstep1"

@database
Scenario: Admin API client wants to update proposal status
  Given I am logged in to api as admin
  When I send a PATCH request to "/api/selection_steps/selectionstep1/selections/3" with json:
  """
  {
    "status": 1
  }
  """
  Then the JSON response status code should be 204
  And selection "selectionstep1" 3 should have status 1
  And 1 mail should be sent
  And I open mail with subject "Le statut de votre proposition vient d’être mis à jour sur Cap-Collectif."
  Then I should see "<li><strong>Nouveau statut :</strong> En cours</li>" in mail
  When I send a PATCH request to "/api/selection_steps/selectionstep1/selections/3" with json:
  """
  {
    "status": null
  }
  """
  Then the JSON response status code should be 204
  And selection "selectionstep1" 3 should have no status
