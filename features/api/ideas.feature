Feature: Ideas

  Scenario: API client wants to know the number of ideas
    When I send a GET request to "/api/ideas"
    Then the JSON response should match:
    """
    {
      "count": "@integer@.greaterThan(0)"
    }
    """

