Feature: Users

  Scenario: API client wants to know the number of users
    When I send a GET request to "/api/users"
    Then the JSON response should match:
    """
    {
      "count": "@integer@.greaterThan(0)"
    }
    """


  Scenario: API client wants to know the number of parlementaires
    When I send a GET request to "/api/users?type=parlementaire"
    Then the JSON response should match:
    """
    {
      "count": "@integer@.greaterThan(0)"
    }
    """
