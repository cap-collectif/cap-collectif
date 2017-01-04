Feature: Districts

## Get

  @parallel-scenario
  Scenario: Anonymous API client wants to retrieve all districts
    When I send a GET request to "/api/districts"
    Then the JSON response should match:
"""
[
  {
    "id": @string@,
    "name": @string@
  },
  @...@
]
"""
