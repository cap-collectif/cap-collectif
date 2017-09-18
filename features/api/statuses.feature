@statuses
Feature: Statuses
  As an API client

@parallel-scenario
Scenario: Anonymous API client wants to get all statuses
  When I send a GET request to "/api/collect_steps/collectstep1/statuses"
  Then the JSON response should match:
"""
[
  {
    "id": @string@,
    "name": @string@,
    "color": @string@
  },
  @...@
]
"""
