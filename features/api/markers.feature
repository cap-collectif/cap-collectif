@markers
Feature: Marker
    As an API client

@parallel-scenario
Scenario: Anonymous API client wants to get all markers from a collect step
  When I send a GET request to "/api/collect_step/collectstep1/markers"
  Then the JSON response status code should be 200
  And the JSON response should match:
  """
  [
    {
      "id": @string@,
      "title": @string@,
      "url": @string@,
      "lat": @number@,
      "lng": @number@,
      "address": @string@,
      "author": {
        "username": @string@,
        "url": @string@
      }
    },
    @...@
  ]
  """

@parallel-scenario
Scenario: Anonymous API client wants to get all markers from a selection step
  When I send a GET request to "/api/selection_step/selectionstep1/markers"
  Then the JSON response status code should be 200
  And the JSON response should match:
  """
  [
    {
      "id": @string@,
      "title": @string@,
      "url": @string@,
      "lat": @number@,
      "lng": @number@,
      "address": @string@,
      "author": {
        "username": @string@,
        "url": @string@
      }
    },
    @...@
  ]
  """
