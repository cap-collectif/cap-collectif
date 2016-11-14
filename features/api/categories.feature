@categories
Feature: Categories

## List Categories

  @parallel-scenario
  Scenario: API client wants to list categories
    When I send a GET request to "/api/categories"
    Then the JSON response should match:
    """
    [
      {
        "id": @integer@,
        "title": @string@,
        "slug": @string@
      },
      @...@
    ]
    """
