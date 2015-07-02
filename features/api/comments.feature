Feature: Comments

  Scenario: API client wants to know the number of comments
    When I send a GET request to "/api/comments"
    Then the JSON response should match:
    """
    {
      "count": "@integer@.greaterThan(0)"
    }
    """
