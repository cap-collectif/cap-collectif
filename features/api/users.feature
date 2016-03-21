@users
Feature: Users

  @parallel-scenario
  Scenario: API client wants to know the number of users
    When I send a GET request to "/api/users"
    Then the JSON response should match:
    """
    {
      "count": "@integer@.greaterThan(0)"
    }
    """

  @parallel-scenario
  Scenario: API client wants to know the number of citoyens
    When I send a GET request to "/api/users?type=citoyen"
    Then the JSON response should match:
    """
    {
      "count": "@integer@.greaterThan(0)"
    }
    """

  @parallel-scenario
  Scenario: API client wants to know the number of citoyens who registered since 2011-11-23
    When I send a GET request to "/api/users?type=citoyen&from=2016-11-23T00:00:00"
    Then the JSON response should match:
    """
    {
      "count": 0
    }
    """

    @database @test
    Scenario: Anonymous API client wants to register
      Given feature "registration" is enabled
      When I send a POST request to "/api/users" with json:
      """
      {
        "username": "user2",
        "email": "user2@test.com",
        "plainPassword": "supersecureuserpass"
      }
      """
      Then the JSON response status code should be 201
