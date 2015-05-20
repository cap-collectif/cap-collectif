Feature: Synthesis
  As an API client
  I want to manage syntheses

  Scenario: API client wants to list syntheses
    Given I send a GET request to "/api/syntheses"
    Then the JSON response should match:
    """
    [
      {
        "id": @string@,
        "enabled": @boolean@,
        "consultation_step": {
          "slug": @string@,
          "step_type": "consultation"
        },
        "elements": []
      }
    ]
    """

  Scenario: API client wants to get a synthesis
    Given I try to get random synthesis
    Then the JSON response should match:
    """
    {
      "id": @string@,
      "enabled": @boolean@,
      "consultation_step": {
        "slug": @string@,
        "step_type": "consultation"
      },
      "elements": []
    }
    """

  @database
  Scenario: API client wants to create a synthesis
    Given I send a POST request to "/api/syntheses" with json:
    """
    {
      "enabled": true
    }
    """
    Then the JSON response status code should be 201