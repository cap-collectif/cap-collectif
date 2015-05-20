Feature: Synthesis
  As an API client
  I want to manage syntheses

  @dev
  Scenario: API client wants to get a synthesis
    Given I send a GET request to "/synthesis/a2854000-ff07-11e4-9585-6c40089c3dd4"
    Then the JSON response should match:
    """
    {
      "id": @string@,
      "consultationStep": {
        "slug": @string@,
        "step_type": "consultation",
      },
      "elements": {}
    }
    """