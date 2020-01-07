@categories
Feature: Source Categories

@parallel-scenario
Scenario: API client wants to list categories
  When I send a GET request to "/api/sourcecategories"
  Then the JSON response should match:
  """
  [
    {
      "id": @string@,
      "title": @string@,
      "slug": @string@
    },
    @...@
  ]
  """
