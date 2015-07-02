Feature: Users

  Scenario: API client wants to know the number of users
    When I send a GET request to "/api/users"
    Then the JSON response should match:
    """
    {
      "count": "@integer@.greaterThan(0)"
    }
    """


  Scenario: API client wants to know the number of citoyens
    When I send a GET request to "/api/users?type=citoyen"
    Then the JSON response should match:
    """
    {
      "count": "@integer@.greaterThan(0)"
    }
    """

  Scenario: API client wants to know the number of citoyens who registred since 2011-11-23
    When I send a GET request to "/api/users?type=citoyen&from=2016-11-23T00:00:00"
    Then the JSON response should match:
    """
    {
      "count": 0
    }
    """

