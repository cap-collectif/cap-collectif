Feature: Themes
  As an API client

@parallel-scenario
Scenario: Anonymous API client wants to get all themes
  When I send a GET request to "/api/themes"
  Then the JSON response should match:
"""
[
  {
    "id": @string@,
    "title": @string@,
    "enabled": @boolean@,
    "_links": {
      "show": @string@
    }
  },
  @...@
]
"""
