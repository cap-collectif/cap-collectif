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
