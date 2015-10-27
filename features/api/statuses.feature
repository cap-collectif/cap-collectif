Feature: Statuses
  As an API client

  Scenario: Anonymous API client wants to get all themes
    When I send a GET request to "/api/statuses"
    Then the JSON response should match:
"""
[
  {
    "id": @integer@,
    "name": @string@
  },
  @...@
]
"""
