@emails
Feature: Email

  @security
  Scenario: Registration is disabled and API client wants re-send an email
    When I send a POST request to "/api/re-send-email-confirmation"
    Then the JSON response status code should be 401
    And the JSON response should match:
    """
    {
      "code":401,
      "message": "Cette fonction n'est pas activ\u00e9e, veuillez l'activer dans l'espace d'administration !",
      "errors": null
    }
    """

  @security
  Scenario: Anonymou API client wants re-send an email
    Given feature "registration" is enabled
    When I send a POST request to "/api/re-send-email-confirmation"
    Then the JSON response status code should be 401
    And the JSON response should match:
    """
    {
      "code": 401,
      "message": "Invalid credentials"
    }
    """

  @security
  Scenario: Confirmed and logged in API client wants re-send an email
    Given feature "registration" is enabled
    And I am logged in to api as user
    When I send a POST request to "/api/re-send-email-confirmation"
    Then the JSON response status code should be 401
    And the JSON response should match:
    """
    {
      "code": 401,
      "message": "Already confirmed.",
      "errors": null
    }
    """
  @database
  Scenario: Not confirmed logged in API client wants re-send a confirmation email
    Given feature "registration" is enabled
    And I am logged in to api as user_not_confirmed
    When I send a POST request to "/api/re-send-email-confirmation"
    Then the JSON response status code should be 201
    When I send a POST request to "/api/re-send-email-confirmation"
    Then the JSON response status code should be 400
