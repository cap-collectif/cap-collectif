Feature: Ideas

  @parallel-scenario
  Scenario: API client wants to know the number of ideas
    When I send a GET request to "/api/ideas"
    Then the JSON response should match:
    """
    {
      "count": "@integer@.greaterThan(0)"
    }
    """

  @parallel-scenario
  Scenario: Non admin wants to get voters of an idea
    Given I am logged in to api as user
    When I send a GET request to "/api/ideas/1/voters"
    Then the JSON response status code should be 401

  @parallel-scenario
  Scenario: Admin wants to get voters of an idea
    Given I am logged in to api as admin
    When I send a GET request to "/api/ideas/1/voters"
    Then the JSON response should match:
    """
    {
      "voters": [
        {
          "username": @string@,
          "email": @string@,
          "isMember": @boolean@
        },
        @...@
      ]
    }
    """
