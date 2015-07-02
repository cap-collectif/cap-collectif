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

  Scenario: API client wants to know the number of parlementaires who registred since 2011-11-23
    When I send a GET request to "/api/users?type=parlementaire&from=2011-11-23T00:00:00"
    Then the JSON response should match:
    """
    {
      "count": "@integer@.greaterThan(0)"
    }
    """

